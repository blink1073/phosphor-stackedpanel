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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  Panel, PanelLayout, ResizeMessage, Widget
} from 'phosphor-widget';

import './index.css';


/**
 * The class name added to StackedPanel instances.
 */
const STACKED_PANEL_CLASS = 'p-StackedPanel';


/**
 * A panel where only one child widget is visible at a time.
 *
 * #### Notes
 * This class provides a convenience wrapper around a [[StackedLayout]].
 */
export
class StackedPanel extends Panel {
  /**
   * Create a stacked layout for a stacked panel.
   */
  static createLayout(): StackedLayout {
    return new StackedLayout();
  }

  /**
   * Construct a new stacked panel.
   */
  constructor() {
    super();
    this.addClass(STACKED_PANEL_CLASS);
    let layout = this.layout as StackedLayout;
    layout.currentChanged.connect((sender, args) => {
      this.currentChanged.emit(args);
    });
    layout.widgetRemoved.connect((sender, args) => {
      this.widgetRemoved.emit(args);
    });
  }

  /**
   * A signal emitted when the current widget is changed.
   */
  get currentChanged(): ISignal<StackedPanel, IChangedArgs<Widget>> {
    return StackedPanelPrivate.currentChangedSignal.bind(this);
  }

  /**
   * A signal emitted when a widget is removed from the panel.
   */
  get widgetRemoved(): ISignal<StackedPanel, Widget> {
    return StackedPanelPrivate.widgetRemovedSignal.bind(this);
  }

  /**
   * Get the current panel widget.
   */
  get currentWidget(): Widget {
    return (this.layout as StackedLayout).currentWidget;
  }

  /**
   * Set the current panel widget.
   */
  set currentWidget(value: Widget) {
    (this.layout as StackedLayout).currentWidget = value;
  }
}


/**
 * A layout where only one child widget is visible at a time.
 */
export
class StackedLayout extends PanelLayout {
  /**
   * A signal emitted when the current widget is changed.
   */
  get currentChanged(): ISignal<StackedLayout, IChangedArgs<Widget>> {
    return StackedLayoutPrivate.currentChangedSignal.bind(this);
  }

  /**
   * A signal emitted when a widget is removed from the layout.
   */
  get widgetRemoved(): ISignal<StackedLayout, Widget> {
    return StackedLayoutPrivate.widgetRemovedSignal.bind(this);
  }

  /**
   * Get the current layout widget.
   */
  get currentWidget(): Widget {
    return StackedLayoutPrivate.currentWidgetProperty.get(this);
  }

  /**
   * Set the current layout widget.
   */
  set currentWidget(value: Widget) {
    StackedLayoutPrivate.currentWidgetProperty.set(this, value);
  }

  /**
   * Attach a child widget to the parent's DOM node.
   *
   * @param index - The current index of the child in the layout.
   *
   * @param child - The child widget to attach to the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected attachChild(index: number, child: Widget): void {
    child.hide();
    this.parent.node.appendChild(child.node);
    if (this.parent.isAttached) sendMessage(child, Widget.MsgAfterAttach);
  }

  /**
   * Move a child widget in the parent's DOM node.
   *
   * @param fromIndex - The previous index of the child in the layout.
   *
   * @param toIndex - The current index of the child in the layout.
   *
   * @param child - The child widget to move in the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected moveChild(fromIndex: number, toIndex: number, child: Widget): void { /* no-op */ }

  /**
   * Detach a child widget from the parent's DOM node.
   *
   * @param index - The previous index of the child in the layout.
   *
   * @param child - The child widget to detach from the parent.
   *
   * #### Notes
   * This is a reimplementation of the superclass method.
   */
  protected detachChild(index: number, child: Widget): void {
    if (child === this.currentWidget) this.currentWidget = null;
    if (this.parent.isAttached) sendMessage(child, Widget.MsgBeforeDetach);
    this.parent.node.removeChild(child.node);
    StackedLayoutPrivate.resetGeometry(child);
    this.widgetRemoved.emit(child);
  }

  /**
   * A message handler invoked on an `'after-show'` message.
   */
  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.parent.update();
  }

  /**
   * A message handler invoked on an `'after-attach'` message.
   */
  protected onAfterAttach(msg: Message): void {
    super.onAfterAttach(msg);
    this.parent.fit();
  }

  /**
   * A message handler invoked on a `'resize'` message.
   */
  protected onResize(msg: ResizeMessage): void {
    if (this.parent.isVisible) {
      StackedLayoutPrivate.update(this, msg.width, msg.height);
    }
  }

  /**
   * A message handler invoked on an `'update-request'` message.
   */
  protected onUpdateRequest(msg: Message): void {
    if (this.parent.isVisible) {
      StackedLayoutPrivate.update(this, -1, -1);
    }
  }

  /**
   * A message handler invoked on a `'fit-request'` message.
   */
  protected onFitRequest(msg: Message): void {
    if (this.parent.isAttached) {
      StackedLayoutPrivate.fit(this);
    }
  }
}


/**
 * The namespace for the `StackedPanel` class private data.
 */
namespace StackedPanelPrivate {
  /**
   * A signal emitted when the current widget is changed.
   */
  export
  const currentChangedSignal = new Signal<StackedPanel, IChangedArgs<Widget>>();

  /**
   * A signal emitted when a widget is removed from the panel.
   */
  export
  const widgetRemovedSignal = new Signal<StackedPanel, Widget>();
}


/**
 * The namespace for the `StackedLayout` class private data.
 */
namespace StackedLayoutPrivate {
  /**
   * A flag indicating whether the browser is IE.
   */
  export
  const IsIE = /Trident/.test(navigator.userAgent);

  /**
   * A signal emitted when the current widget is changed.
   */
  export
  const currentChangedSignal = new Signal<StackedLayout, IChangedArgs<Widget>>();

  /**
   * A signal emitted when a widget is removed from the layout.
   */
  export
  const widgetRemovedSignal = new Signal<StackedLayout, Widget>();

  /**
   * The property descriptor for the current widget.
   */
  export
  const currentWidgetProperty = new Property<StackedLayout, Widget>({
    name: 'currentWidget',
    value: null,
    coerce: coerceCurrentWidget,
    changed: onCurrentWidgetChanged,
    notify: currentChangedSignal,
  });

  /**
   * Reset the layout geometry for the given child widget.
   */
  export
  function resetGeometry(widget: Widget): void {
    let rect = rectProperty.get(widget);
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

  /**
   * Fit the layout to the total size required by the child widgets.
   */
  export
  function fit(layout: StackedLayout): void {
    // Bail early if there is no parent.
    let parent = layout.parent;
    if (!parent) {
      return;
    }

    // Compute the new size limits.
    let minW = 0;
    let minH = 0;
    let maxW = Infinity;
    let maxH = Infinity;
    let widget = layout.currentWidget
    if (widget) {
      let limits = sizeLimits(widget.node);
      minW = limits.minWidth;
      minH = limits.minHeight;
      maxW = limits.maxWidth;
      maxH = limits.maxHeight;
    }

    // Update the box sizing and add it to the size constraints.
    let box = boxSizing(parent.node);
    boxSizingProperty.set(parent, box);
    minW += box.horizontalSum;
    minH += box.verticalSum;
    maxW += box.horizontalSum;
    maxH += box.verticalSum;

    // Update the panel's size constraints.
    let style = parent.node.style;
    style.minWidth = minW + 'px';
    style.minHeight = minH + 'px';
    style.maxWidth = maxW === Infinity ? 'none' : maxW + 'px';
    style.maxHeight = maxH === Infinity ? 'none' : maxH + 'px';

    // Notify the ancestor that it should fit immediately.
    if (parent.parent) sendMessage(parent.parent, Widget.MsgFitRequest);

    // Notify the parent that it should update immediately.
    sendMessage(parent, Widget.MsgUpdateRequest);
  }

  /**
   * Layout the children using the given offset width and height.
   *
   * If the dimensions are unknown, they should be specified as `-1`.
   */
  export
  function update(layout: StackedLayout, offsetWidth: number, offsetHeight: number): void {
    // Bail early if there is no current widget.
    let widget = layout.currentWidget;
    if (!widget) {
      return;
    }

    // Bail early if there is no parent.
    let parent = layout.parent;
    if (!parent) {
      return;
    }

    // Measure the parent if the offset dimensions are unknown.
    if (offsetWidth < 0) {
      offsetWidth = parent.node.offsetWidth;
    }
    if (offsetHeight < 0) {
      offsetHeight = parent.node.offsetHeight;
    }

    // Compute the actual layout bounds adjusted for border and padding.
    let box = boxSizingProperty.get(parent);
    let top = box.paddingTop;
    let left = box.paddingLeft;
    let width = offsetWidth - box.horizontalSum;
    let height = offsetHeight - box.verticalSum;

    // Update the current widget's layout geometry.
    setGeometry(widget, left, top, width, height);
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
   * A property descriptor for a widget offset rect.
   */
  var rectProperty = new Property<Widget, IRect>({
    name: 'rect',
    create: () => ({ top: NaN, left: NaN, width: NaN, height: NaN }),
  });

  /**
   * A property descriptor for the box sizing of a widget.
   */
  var boxSizingProperty = new Property<Widget, IBoxSizing>({
    name: 'boxSizing',
    create: owner => boxSizing(owner.node),
  });

  /**
   * The coerce handler for the `currentWidget` property.
   */
  function coerceCurrentWidget(owner: StackedLayout, value: Widget): Widget {
    return (value && owner.childIndex(value) !== -1) ? value : null;
  }

  /**
   * The change handler for the `currentWidget` property.
   */
  function onCurrentWidgetChanged(owner: StackedLayout, old: Widget, val: Widget): void {
    if (old) old.hide();
    if (val) val.show();
    // IE paints before firing animation frame callbacks when toggling
    // `display: none`. This causes flicker, so IE is fit immediately.
    if (IsIE) {
      sendMessage(this.parent, Widget.MsgFitRequest);
    } else {
      this.parent.fit();
    }
  }

  /**
   * Set the offset geometry for the given widget.
   *
   * A resize message will be dispatched to the widget if appropriate.
   */
  function setGeometry(widget: Widget, left: number, top: number, width: number, height: number): void {
    let resized = false;
    let style = widget.node.style;
    let rect = rectProperty.get(widget);
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
}
