/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

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
    msg.child.clearOffsetGeometry();
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
      if (msg.width < 0 || msg.height < 0) {
        var rect = this.offsetRect;
        this._layoutChildren(rect.width, rect.height);
      } else {
        this._layoutChildren(msg.width, msg.height);
      }
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.isVisible) {
      var rect = this.offsetRect;
      this._layoutChildren(rect.width, rect.height);
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
    var minW = 0;
    var minH = 0;
    var maxW = Infinity;
    var maxH = Infinity;
    var widget = this.currentWidget
    if (widget) {
      var limits = widget.sizeLimits;
      minW = limits.minWidth;
      minH = limits.minHeight;
      maxW = limits.maxWidth;
      maxH = limits.maxHeight;
    }

    // Add the box sizing to the size constraints.
    var box = this.boxSizing;
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the panel's size constraints.
    this.setSizeLimits(minW, minH, maxW, maxH);

    // Notifiy the parent that it should relayout.
    if (this.parent) sendMessage(this.parent, MSG_LAYOUT_REQUEST);

    // Update the layout for the child widgets.
    this.update(true);
  }

  /**
   * Layout the children using the given offset width and height.
   */
  private _layoutChildren(offsetWidth: number, offsetHeight: number): void {
    // Bail early if there is no current widget.
    var widget = this.currentWidget;
    if (!widget) {
      return;
    }

    // Compute the actual layout bounds adjusted for border and padding.
    var box = this.boxSizing;
    var top = box.paddingTop;
    var left = box.paddingLeft;
    var width = offsetWidth - box.horizontalSum;
    var height = offsetHeight - box.verticalSum;

    // Update the current widget's layout geometry.
    widget.setOffsetGeometry(left, top, width, height);
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
    sendMessage(this, MSG_LAYOUT_REQUEST);
    this.currentChanged.emit({ index: this.childIndex(val), widget: val });
  }
}
