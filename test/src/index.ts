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
  Message, sendMessage
} from 'phosphor-messaging';

import {
  Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  MSG_LAYOUT_REQUEST, MSG_UPDATE_REQUEST, attachWidget, ResizeMessage, Widget
} from 'phosphor-widget';

import {
  IWidgetIndexArgs, StackedPanel, STACKED_PANEL_CLASS
} from '../../lib/index';



class LogPanel extends StackedPanel {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


class LogWidget extends Widget {

  messages: string[] = [];

  processMessage(msg: Message): void {
    super.processMessage(msg);
    this.messages.push(msg.type);
  }
}


describe('phosphor-stackedpanel', () => {

  describe('STACKED_PANEL_CLASS', () => {

    it('should equal `p-StackedPanel`', () => {
      expect(STACKED_PANEL_CLASS).to.be('p-StackedPanel');
    });

  });

  describe('StackedPanel', () => {

    describe('.currentChangedSignal', () => {

      it('should be a signal', () => {
        expect(StackedPanel.currentChangedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.widgetRemovedSignal', () => {

      it('should be a signal', () => {
        expect(StackedPanel.widgetRemovedSignal instanceof Signal).to.be(true);
      });

    });

    describe('.currentWidgetProperty', () => {

      it('should be a property descriptor', () => {
        expect(StackedPanel.currentWidgetProperty instanceof Property).to.be(true);
      });

      it('should default to `null`', () => {
        var panel = new StackedPanel();
        expect(StackedPanel.currentWidgetProperty.get(panel)).to.be(null);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var panel = new StackedPanel();
        expect(panel instanceof StackedPanel).to.be(true);
      });

      it('should set `STACKED_PANEL_CLASS`', () => {
        var panel = new StackedPanel();
        expect(panel.hasClass(STACKED_PANEL_CLASS)).to.be(true)
      });

    });

    describe('#currentChanged', () => {

      it('should be emitted when the current widget is changed', () => {
        var called = false;
        var panel = new StackedPanel();
        panel.currentChanged.connect(() => { called = true; });
        var widget0 = new Widget();
        panel.addChild(widget0);
        expect(called).to.be(false);
        panel.currentWidget = widget0;
        expect(called).to.be(true);

        called = false;
        var widget1 = new Widget();
        panel.addChild(widget1);
        expect(called).to.be(false);
        panel.currentWidget = widget0;
        expect(called).to.be(false);
        panel.currentWidget = widget1;
        expect(called).to.be(true);
      });

    });

    describe('#widgetRemoved', () => {

      it('should be emitted when a widget is removed', () => {
        var called = false;
        var panel = new StackedPanel();
        panel.widgetRemoved.connect(() => { called = true; });
        var widget0 = new Widget();
        panel.addChild(widget0);
        expect(called).to.be(false);
        panel.removeChild(widget0);
        expect(called).to.be(true);

        called = false;
        var widget1 = new Widget();
        panel.addChild(widget1);
        expect(called).to.be(false);
        panel.removeChild(widget1);
        expect(called).to.be(true);
      });

    });

    describe('#currentWidget', () => {

      it('should be `null` if there are no widgets', () => {
        var panel = new StackedPanel();
        expect(panel.currentWidget).to.be(null);
      });

      it('should be equal to the current widget', () => {
        var panel = new StackedPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.addChild(widget0);
        expect(panel.currentWidget).to.be(null);
        panel.currentWidget = widget0;
        expect(panel.currentWidget).to.eql(widget0);
        panel.addChild(widget1);
        expect(panel.currentWidget).to.eql(widget0);
        panel.currentWidget = widget1;
        expect(panel.currentWidget).to.eql(widget1);
      });

      it('should be a pure delegate to the `currentWidgetProperty`', () => {
        var panel = new StackedPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.children = [widget0, widget1];
        panel.currentWidget = widget0;
        expect(StackedPanel.currentWidgetProperty.get(panel)).to.eql(widget0);
        StackedPanel.currentWidgetProperty.set(panel, widget1);
        expect(panel.currentWidget).to.eql(widget1);
      });

    });

    describe('#onChildAdded()', () => {

      it('should hide the new node', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.messages = [];
        panel.addChild(widget);
        expect(panel.messages[0]).to.be('child-hidden');
        expect(panel.messages[1]).to.be('child-added');
        expect(widget.hidden).to.be(true);
      });

    });

    describe('#onChildRemoved()', () => {

      it('should clear child offset geometry', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        widget.setOffsetGeometry(10, 10, 100, 100);
        attachWidget(panel, document.body);

        panel.addChild(widget);
        panel.currentWidget = widget;
        panel.messages = [];
        panel.removeChild(widget);
        expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
        expect(widget.offsetRect.left).to.be(0);
      });

    });

    describe('#onChildMoved()', () => {

      it('should be a no-op', () => {
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.children = [widget0, widget1];
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked just after the panel is made visible', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        panel.hidden = true;
        panel.hidden = false;
        expect(panel.messages.indexOf('after-show')).to.not.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked just after the panel is attached', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });
    });

    describe('#onResize()', () => {

      it('should set up the child geometry', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        var msg = new ResizeMessage(50, 55);
        sendMessage(panel, msg);
        expect(widget.offsetRect.width).to.be(50);
        expect(widget.offsetRect.height).to.be(55);
      });

      it('should inherit the panel geometry', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.setOffsetGeometry(10, 10, 110, 115);
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        var msg = new ResizeMessage(-1, -1);
        sendMessage(panel, msg);
        expect(widget.offsetRect.width).to.be(110);
        expect(widget.offsetRect.height).to.be(115);
      });

      it('should be a no-op if invisible', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        panel.hidden = true;
        var msg = new ResizeMessage(50, 55);
        sendMessage(panel, msg);
        expect(widget.offsetRect.width).to.not.be(50);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked when an update is requested', () => {
        var panel = new LogPanel();
        sendMessage(panel, MSG_UPDATE_REQUEST);
        expect(panel.messages[0]).to.be('update-request');
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should set child widget geometry', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.setOffsetGeometry(10, 10, 110, 115);
        attachWidget(panel, document.body);
        panel.addChild(widget);
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(widget.offsetRect.width).to.be(0);
        panel.currentWidget = widget;
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(widget.offsetRect.width).to.be(110);
        expect(widget.offsetRect.height).to.be(115);
      });

      it('should be a no-op if invisible', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.setOffsetGeometry(10, 10, 110, 115);
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.hidden = true;
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(widget.offsetRect.width).to.be(0);
        panel.currentWidget = widget;
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(widget.offsetRect.width).to.not.be(110);
      });

      it('should be propagated to a parent', () => {
        var parent = new LogWidget();
        var panel = new LogPanel();
        attachWidget(parent, document.body);
        parent.addChild(panel);
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(parent.messages.indexOf('layout-request')).to.not.be(-1);
      });

    });

  });

});
