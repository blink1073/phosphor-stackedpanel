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
  Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ChildMessage, MSG_AFTER_ATTACH, MSG_BEFORE_DETACH, MSG_LAYOUT_REQUEST,
  ResizeMessage, Widget
} from 'phosphor-widget';

import './index.css';


/**
 * `p-StackedPanel`: the class name added to StackedPanel instances.
 */
export
const STACKED_PANEL_CLASS = 'p-StackedPanel';


/**
 * The arguments object emitted with various [[StackedPanel]] signals.
 */
export
interface IWidgetIndexArgs {
  /**
   * The index associated with the widget.
   */
  index: number;

  /**
   * The widget associated with the signal.
   */
  widget: Widget;
}


/**
 * A layout widget where only one child widget is visible at a time.
 */
export
class StackedPanel extends Widget {
  /**
   * A signal emitted when the current widget is changed.
   *
   * **See also:** [[currentChanged]]
   */
  static currentChangedSignal = new Signal<StackedPanel, IWidgetIndexArgs>();

  /**
   * A signal emitted when a widget is removed from the panel.
   *
   * **See also:** [[widgetRemoved]]
   */
  static widgetRemovedSignal = new Signal<StackedPanel, IWidgetIndexArgs>();

  /**
   * The property descriptor for the current widget.
   *
   * This controls which child widget is visible.
   *
   * **See also:** [[currentWidget]]
   */
  static currentWidgetProperty = new Property<StackedPanel, Widget>({
    value: null,
    coerce: (owner, val) => (val && val.parent === owner) ? val : null,
    changed: (owner, old, val) => owner._onCurrentWidgetChanged(old, val),
  });

  /**
   * Construct a new stacked panel.
   */
  constructor() {
    super();
    this.addClass(STACKED_PANEL_CLASS);
  }

  /**
   * Dispose of the resources held by the panel.
   */
  dispose(): void {
    this._item = null;
    super.dispose();
  }

  /**
   * A signal emitted when the current widget is changed.
   *
   * #### Notes
   * This is a pure delegate to the [[currentChangedSignal]].
   */
  get currentChanged(): ISignal<StackedPanel, IWidgetIndexArgs> {
    return StackedPanel.currentChangedSignal.bind(this);
  }

  /**
   * A signal emitted when a widget is removed from the panel.
   *
   * #### Notes
   * This is a pure delegate to the [[widgetRemovedSignal]].
   */
  get widgetRemoved(): ISignal<StackedPanel, IWidgetIndexArgs> {
    return StackedPanel.widgetRemovedSignal.bind(this);
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
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildMessage): void {
    msg.child.hidden = true;
    this.node.appendChild(msg.child.node);
    if (this.isAttached) sendMessage(msg.child, MSG_AFTER_ATTACH);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    if (msg.child === this.currentWidget) this.currentWidget = null;
    if (this.isAttached) sendMessage(msg.child, MSG_BEFORE_DETACH);
    this.node.removeChild(msg.child.node);
    this.widgetRemoved.emit({ index: msg.previousIndex, widget: msg.child });
  }

  /**
   * A message handler invoked on a `'child-moved'` message.
   */
  protected onChildMoved(msg: ChildMessage): void { /* no-op */ }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    this.update(true);
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    postMessage(this, MSG_LAYOUT_REQUEST);
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.isVisible) {
      var width = msg.width < 0 ? this.node.offsetWidth : msg.width;
      var height = msg.height < 0 ? this.node.offsetHeight : msg.height;
      this._layoutItems(width, height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isVisible) {
      this._layoutItems(this.node.offsetWidth, this.node.offsetHeight);
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
   * Update the stack item and size constraints of the panel.
   */
  private _setupGeometry(): void {
    // Compute the new size limits.
    var minW = 0;
    var minH = 0;
    var maxW = Infinity;
    var maxH = Infinity;
    if (this._item) {
      var limits = sizeLimits(this._item.widget.node);
      minW = limits.minWidth;
      minH = limits.minHeight;
      maxW = limits.maxWidth;
      maxH = limits.maxHeight;
    }

    // Add the box sizing to the size constraints.
    var box = this._box = boxSizing(this.node);
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the inline style size constraints.
    var style = this.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW < Infinity ? maxW + 'px' : '';
    style.maxHeight = maxH < Infinity ? maxH + 'px' : '';

    // Notifiy the parent that it should relayout.
    if (this.parent) sendMessage(this.parent, MSG_LAYOUT_REQUEST);

    // Update the layout for the child widgets.
    this.update(true);
  }

  /**
   * Layout the items using the given offset width and height.
   */
  private _layoutItems(offsetWidth: number, offsetHeight: number): void {
    // Bail early if there is no current item.
    if (!this._item) {
      return;
    }

    // Ensure the box sizing is computed for the panel.
    var box = this._box || (this._box = boxSizing(this.node));

    // Compute the actual layout bounds adjusted for border and padding.
    var top = box.paddingTop;
    var left = box.paddingLeft;
    var width = offsetWidth - box.horizontalSum;
    var height = offsetHeight - box.verticalSum;

    // Update the current item layout.
    this._item.layoutWidget(left, top, width, height);
  }

  /**
   * The change handler for the [[currentWidgetProperty]].
   */
  private _onCurrentWidgetChanged(old: Widget, val: Widget): void {
    if (old) old.hidden = true;
    if (val) val.hidden = false;
    this._item = val ? new StackItem(val) : null;
    // Ideally, the layout request would be posted in order to take
    // advantage of message compression, but some browsers repaint
    // before the message gets processed, resulting in jitter. So,
    // the layout request is sent and processed immediately.
    sendMessage(this, MSG_LAYOUT_REQUEST);
    this.currentChanged.emit({ index: this.childIndex(val), widget: val });
  }

  private _box: IBoxSizing = null;
  private _item: StackItem = null;
}


/**
 * A class which assists with the layout of a widget.
 */
class StackItem {
  /**
   * Construct a new stack item.
   */
  constructor(widget: Widget) {
    this._widget = widget;
  }

  /**
   * Get the widget for the item.
   */
  get widget(): Widget {
    return this._widget;
  }

  /**
   * Update the layout geometry for the widget.
   */
  layoutWidget(left: number, top: number, width: number, height: number): void {
    var resized = false;
    var style = this._widget.node.style;
    if (left !== this._left) {
      this._left = left;
      style.left = left + 'px';
    }
    if (top !== this._top) {
      this._top = top;
      style.top = top + 'px';
    }
    if (width !== this._width) {
      resized = true;
      this._width = width;
      style.width = width + 'px';
    }
    if (height !== this._height) {
      resized = true;
      this._height = height;
      style.height = height + 'px';
    }
    if (resized) sendMessage(this._widget, new ResizeMessage(width, height));
  }

  private _widget: Widget;
  private _top = NaN;
  private _left = NaN;
  private _width = NaN;
  private _height = NaN;
}
