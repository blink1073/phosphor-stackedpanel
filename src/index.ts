/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  IBoxSizing, boxSizing, sizeLimits
} from 'phosphor-domutil';

import {
  Message, postMessage, sendMessage
} from 'phosphor-messaging';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ChildIndexMessage, Panel, ResizeMessage, Widget
} from 'phosphor-widget';

import './index.css';


/**
 * The class name added to StackedPanel instances.
 */
const STACKED_PANEL_CLASS = 'p-StackedPanel';


/**
 * A panel where only one child widget is visible at a time.
 */
export
class StackedPanel extends Panel {
  /**
   * The property descriptor for the current widget.
   *
   * This controls which child widget is currently visible.
   *
   * **See also:** [[currentWidget]]
   */
  static currentWidgetProperty = new Property<StackedPanel, Widget>({
    name: 'currentWidget',
    value: null,
    coerce: (owner, val) => (val && val.parent === owner) ? val : null,
    changed: (owner, old, val) => owner._onCurrentWidgetChanged(old, val),
    notify: new Signal<StackedPanel, IChangedArgs<Widget>>(),
  });

  /**
   * Construct a new stacked panel.
   */
  constructor() {
    super();
    this.addClass(STACKED_PANEL_CLASS);
  }

  /**
   * Get the current panel widget.
   *
   * #### Notes
   * This is a pure delegate to the [[currentWidgetProperty]].
   */
  get currentWidget(): Widget {
    return StackedPanel.currentWidgetProperty.get(this);
  }

  /**
   * Set the current panel widget.
   *
   * #### Notes
   * This is a pure delegate to the [[currentWidgetProperty]].
   */
  set currentWidget(widget: Widget) {
    StackedPanel.currentWidgetProperty.set(this, widget);
  }

  /**
   * A signal emitted when the current widget is changed.
   *
   * #### Notes
   * This is the notify signal for the [[currentWidgetProperty]].
   */
  get currentWidgetChanged(): ISignal<StackedPanel, IChangedArgs<Widget>> {
    return StackedPanel.currentWidgetProperty.notify.bind(this);
  }

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildIndexMessage): void {
    msg.child.hidden = true;
    this.node.appendChild(msg.child.node);
    if (this.isAttached) sendMessage(msg.child, Widget.MsgAfterAttach);
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   */
  protected onChildMoved(msg: ChildIndexMessage): void { /* no-op */ }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildIndexMessage): void {
    if (msg.child === this.currentWidget) this.currentWidget = null;
    if (this.isAttached) sendMessage(msg.child, Widget.MsgBeforeDetach);
    this.node.removeChild(msg.child.node);
    resetGeometry(msg.child);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    sendMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    postMessage(this, Panel.MsgLayoutRequest);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.isVisible) {
      let width = msg.width < 0 ? this.node.offsetWidth : msg.width;
      let height = msg.height < 0 ? this.node.offsetHeight : msg.height;
      this._layoutChildren(width, height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isVisible) {
      this._layoutChildren(this.node.offsetWidth, this.node.offsetHeight);
    }
  }

  /**
   * A message handler invoked on a `'layout-request'` message.
   */
  protected onLayoutRequest(msg: Message): void {
    if (this.isAttached) {
      this._setupGeometry();
    }
  }

  /**
   * Update the size constraints of the panel.
   */
  private _setupGeometry(): void {
    // Compute the new size limits.
    let minW = 0;
    let minH = 0;
    let maxW = Infinity;
    let maxH = Infinity;
    let widget = this.currentWidget
    if (widget) {
      let limits = sizeLimits(widget.node);
      minW = limits.minWidth;
      minH = limits.minHeight;
      maxW = limits.maxWidth;
      maxH = limits.maxHeight;
    }

    // Update the box sizing and add it to the size constraints.
    this._box = boxSizing(this.node);
    minW += this._box.horizontalSum;
    minH += this._box.verticalSum;
    maxW += this._box.horizontalSum;
    maxH += this._box.verticalSum;

    // Update the panel's size constraints.
    let style = this.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW === Infinity ? 'none' : maxW + 'px';
    style.maxHeight = maxH === Infinity ? 'none' : maxH + 'px';

    // Notifiy the parent that it should relayout.
    if (this.parent) sendMessage(this.parent, Panel.MsgLayoutRequest);

    // Update the layout for the child widgets.
    sendMessage(this, Widget.MsgUpdateRequest);
  }

  /**
   * Layout the children using the given offset width and height.
   */
  private _layoutChildren(offsetWidth: number, offsetHeight: number): void {
    // Bail early if there is no current widget.
    let widget = this.currentWidget;
    if (!widget) {
      return;
    }

    // Ensure the box sizing is created.
    let box = this._box || (this._box = boxSizing(this.node));

    // Compute the actual layout bounds adjusted for border and padding.
    let top = box.paddingTop;
    let left = box.paddingLeft;
    let width = offsetWidth - box.horizontalSum;
    let height = offsetHeight - box.verticalSum;

    // Update the current widget's layout geometry.
    setGeometry(widget, left, top, width, height);
  }

  /**
   * The change handler for the [[currentWidgetProperty]].
   */
  private _onCurrentWidgetChanged(old: Widget, val: Widget): void {
    if (old) old.hidden = true;
    if (val) val.hidden = false;
    // Ideally, the layout request would be posted in order to take
    // advantage of message compression, but some browsers repaint
    // before the message gets processed, resulting in jitter. So,
    // the layout request is sent and processed immediately.
    sendMessage(this, Panel.MsgLayoutRequest);
  }

  private _box: IBoxSizing = null;
}


/**
 * An object which represents an offset rect.
 */
interface IRect {
  /**
   * The offset top edge, in pixels.
   */
  top: number;

  /**
   * The offset left edge, in pixels.
   */
  left: number;

  /**
   * The offset width, in pixels.
   */
  width: number;

  /**
   * The offset height, in pixels.
   */
  height: number;
}


/**
 * A private attached property which stores a widget offset rect.
 */
const rectProperty = new Property<Widget, IRect>({
  name: 'rect',
  create: createRect,
});


/**
 * Create a new offset rect filled with NaNs.
 */
function createRect(): IRect {
  return { top: NaN, left: NaN, width: NaN, height: NaN };
}


/**
 * Get the offset rect for a widget.
 */
function getRect(widget: Widget): IRect {
  return rectProperty.get(widget);
}


/**
 * Set the offset geometry for the given widget.
 *
 * A resize message will be dispatched to the widget if appropriate.
 */
function setGeometry(widget: Widget, left: number, top: number, width: number, height: number): void {
  let resized = false;
  let rect = getRect(widget);
  let style = widget.node.style;
  if (rect.top !== top) {
    rect.top = top;
    style.top = top + 'px';
  }
  if (rect.left !== left) {
    rect.left = left;
    style.left = left + 'px';
  }
  if (rect.width !== width) {
    resized = true;
    rect.width = width;
    style.width = width + 'px';
  }
  if (rect.height !== height) {
    resized = true;
    rect.height = height;
    style.height = height + 'px';
  }
  if (resized) {
    sendMessage(widget, new ResizeMessage(width, height));
  }
}


/**
 * Reset the inline geometry and rect cache for the given widget
 */
function resetGeometry(widget: Widget): void {
  let rect = getRect(widget);
  let style = widget.node.style;
  rect.top = NaN;
  rect.left = NaN;
  rect.width = NaN;
  rect.height = NaN;
  style.top = '';
  style.left = '';
  style.width = '';
  style.height = '';
}
