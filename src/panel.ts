/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import {
  Panel
} from 'phosphor-panel';

import {
  ISignal, Signal
} from 'phosphor-signaling';

import {
  ChildMessage, Widget
} from 'phosphor-widget';

import {
  StackedLayout
} from './layout';


/**
 * The class name added to StackedPanel instances.
 */
const STACKED_PANEL_CLASS = 'p-StackedPanel';

/**
 * The class name added to a StackedPanel child.
 */
const CHILD_CLASS = 'p-StackedPanel-child';


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

  /**
   * A message handler invoked on a `'child-added'` message.
   */
  protected onChildAdded(msg: ChildMessage): void {
    msg.child.addClass(CHILD_CLASS);
  }

  /**
   * A message handler invoked on a `'child-removed'` message.
   */
  protected onChildRemoved(msg: ChildMessage): void {
    msg.child.removeClass(CHILD_CLASS);
    this.widgetRemoved.emit(msg.child);
  }
}


/**
 * The namespace for the `StackedPanel` class private data.
 */
namespace StackedPanelPrivate {
  /**
   * A signal emitted when a widget is removed from the panel.
   */
  export
  const widgetRemovedSignal = new Signal<StackedPanel, Widget>();
}
