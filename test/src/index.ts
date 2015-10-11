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
  Property
} from 'phosphor-properties';

import {
  Signal
} from 'phosphor-signaling';

import {
  MSG_LAYOUT_REQUEST, ResizeMessage, Widget, attachWidget
} from 'phosphor-widget';

import {
  StackedPanel
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

  describe('StackedPanel', () => {

    describe('.p_StackedPanel', () => {

      it('should equal `p-StackedPanel`', () => {
        expect(StackedPanel.p_StackedPanel).to.be('p-StackedPanel');
      });

    });

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

      it('should send a `layout-request`', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.children = [widget];
        panel.messages = [];
        StackedPanel.currentWidgetProperty.set(panel, widget);
        expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
      });

    });

    describe('#constructor()', () => {

      it('should accept no arguments', () => {
        var panel = new StackedPanel();
        expect(panel instanceof StackedPanel).to.be(true);
      });

      it('should add the `p-StackedPanel` class', () => {
        var panel = new StackedPanel();
        expect(panel.hasClass(StackedPanel.p_StackedPanel)).to.be(true)
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

      it('should be invoked when a child is added', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        expect(panel.messages.indexOf('child-added')).to.not.be(-1);
      });

      it('should hide the new child', () => {
        var panel = new StackedPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        expect(widget.hidden).to.be(false);
        panel.addChild(widget);
        expect(widget.hidden).to.be(true);
      });

      it('should send `after-attach` to the child', () => {
        var panel = new StackedPanel();
        var widget = new LogWidget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
      });

    });

    describe('#onChildRemoved()', () => {

      it('should be invoked when a child is added', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.removeChild(widget);
        expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
      });

      it('should clear child offset geometry', () => {
        var panel = new StackedPanel();
        var widget = new Widget();
        widget.setOffsetGeometry(10, 10, 100, 100);
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        panel.removeChild(widget);
        expect(widget.offsetRect.left).to.be(0);
      });

      it('should send `before-detach` to the child', () => {
        var panel = new StackedPanel();
        var widget = new LogWidget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.removeChild(widget);
        expect(widget.messages.indexOf('before-detach')).to.not.be(-1);
      });

    });

    describe('#onChildMoved()', () => {

      it('should be invoked when a child is moved', () => {
        var panel = new LogPanel();
        var widget0 = new Widget();
        var widget1 = new Widget();
        panel.children = [widget0, widget1];
        panel.moveChild(1, 0);
        expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
      });

    });

    describe('#onAfterShow()', () => {

      it('should be invoked after the panel is shown', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        panel.hidden = true;
        panel.messages = [];
        panel.hidden = false;
        expect(panel.messages.indexOf('after-show')).to.not.be(-1);
      });

      it('should send an `update-request`', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        panel.hidden = true;
        panel.messages = [];
        panel.hidden = false;
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

    });

    describe('#onAfterAttach()', () => {

      it('should be invoked after the panel is attached', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
      });

      it('should post a `layout-request`', (done) => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        expect(panel.messages.indexOf('layout-request')).to.be(-1);
        requestAnimationFrame(() => {
          expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
          done();
        });
      });

    });

    describe('#onResize()', () => {

      it('should be invoked on a `resize` message', () => {
        var panel = new LogPanel();
        var message = new ResizeMessage(100, 100);
        attachWidget(panel, document.body);
        sendMessage(panel, message);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should handle an unknown size', () => {
        var panel = new LogPanel();
        attachWidget(panel, document.body);
        sendMessage(panel, ResizeMessage.UnknownSize);
        expect(panel.messages.indexOf('resize')).to.not.be(-1);
      });

      it('should resize the current widget', () => {
        var panel = new StackedPanel();
        var widget = new Widget();
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        panel.setOffsetGeometry(0, 0, 100, 100);
        expect(widget.offsetRect.width).to.be(100);
        expect(widget.offsetRect.height).to.be(100);
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should be invoked on an `update-request` message', () => {
        var panel = new LogPanel();
        panel.update(true);
        expect(panel.messages.indexOf('update-request')).to.not.be(-1);
      });

      it('should resize the current widget', () => {
        var panel = new LogPanel();
        var widget = new Widget();
        panel.setOffsetGeometry(10, 10, 110, 115);
        attachWidget(panel, document.body);
        panel.addChild(widget);
        panel.currentWidget = widget;
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(widget.offsetRect.width).to.be(110);
        expect(widget.offsetRect.height).to.be(115);
        widget.setOffsetGeometry(0, 0, 10, 10);
        expect(widget.offsetRect.width).to.be(10);
        expect(widget.offsetRect.height).to.be(10);
        panel.update(true);
        expect(widget.offsetRect.width).to.be(110);
        expect(widget.offsetRect.height).to.be(115);
      });

    });

    describe('#onLayoutRequest()', () => {

      it('should be invoked on a `layout-request` message', () => {
        var panel = new LogPanel();
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should send a `layout-request` to its parent', () => {
        var panel1 = new LogWidget();
        var panel2 = new StackedPanel();
        panel2.parent = panel1;
        attachWidget(panel1, document.body);
        clearMessageData(panel1);
        clearMessageData(panel2);
        expect(panel1.messages.indexOf('layout-request')).to.be(-1);
        sendMessage(panel2, MSG_LAYOUT_REQUEST);
        expect(panel1.messages.indexOf('layout-request')).to.not.be(-1);
      });

      it('should setup the geometry of the panel', () => {
        var panel = new StackedPanel();
        var child = new Widget();
        child.node.style.minWidth = '50px';
        child.node.style.minHeight = '50px';
        panel.children = [child];
        panel.currentWidget = child;
        attachWidget(panel, document.body);
        expect(panel.node.style.minWidth).to.be('');
        expect(panel.node.style.minHeight).to.be('');
        sendMessage(panel, MSG_LAYOUT_REQUEST);
        expect(panel.node.style.minWidth).to.be('50px');
        expect(panel.node.style.minHeight).to.be('50px');
      });

    });

  });

});
