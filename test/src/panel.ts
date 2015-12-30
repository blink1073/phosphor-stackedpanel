/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

import {
  Message, clearMessageData, sendMessage
} from 'phosphor-messaging';

import {
  Panel
} from 'phosphor-panel';

import {
  IChangedArgs, Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  ChildMessage, Widget
} from 'phosphor-widget';

import {
  StackedLayout, StackedPanel
} from '../../lib/index';


class LogPanel extends StackedPanel {

  messages: string[] = [];

  methods: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }

  protected onChildAdded(msg: ChildMessage): void {
    super.onChildAdded(msg);
    this.methods.push('onChildAdded');
  }

  protected onChildRemoved(msg: ChildMessage): void {
    super.onChildRemoved(msg);
    this.methods.push('onChildRemoved');
  }

}


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


class BaseLogPanel extends Panel {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


describe('phosphor-stackedpanel', () => {

  describe('StackedPanel', () => {

    describe('.createLayout', () => {

      it('should create a stacked layout for a stacked panel', () => {
        let layout = StackedPanel.createLayout();
        expect(layout instanceof StackedLayout).to.be(true);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        let panel = new StackedPanel();
        expect(panel instanceof StackedPanel).to.be(true);
      });

      it('should add the `p-StackedPanel` class', () => {
        let panel = new StackedPanel();
        expect(panel.hasClass('p-StackedPanel')).to.be(true)
      });

    });

    describe('#widgetRemoved', () => {

      it('should be emitted when a widget is removed from the panel', () => {
        let called = false;
        let panel = new StackedPanel();
        let child = new Widget();
        child.parent = panel;
        panel.widgetRemoved.connect(() => { called = true; });
        child.parent = null;
        expect(called).to.be(true);
      });

    });

    describe('#onChildAdded()', () => {

      it("should add `'p-StackedPanel-child'` to the child classList", () => {
        let panel = new LogPanel();
        let widget = new Widget();
        panel.addChild(widget);
        expect(widget.hasClass('p-StackedPanel-child')).to.be(true);
        expect(panel.methods.indexOf('onChildAdded')).to.not.be(-1);
      });

    });

    describe('#onChildRemoved()', () => {

      it("should remove `'p-StackedPanel-child'` from the child classList", () => {
        let panel = new LogPanel();
        let widget = new Widget();
        panel.addChild(widget);
        widget.parent = null;
        expect(widget.hasClass('p-StackedPanel-child')).to.be(false);
        expect(panel.methods.indexOf('onChildRemoved')).to.not.be(-1);
      });

    });

  });

});
