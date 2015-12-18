/*-----------------------------------------------------------------------------
| Copyright (c) 2014-2015, PhosphorJS Contributors
|
| Distributed under the terms of the BSD 3-Clause License.
|
| The full license is in the file LICENSE, distributed with this software.
|----------------------------------------------------------------------------*/
'use strict';

import expect = require('expect.js');

// import {
//   Message, clearMessageData, sendMessage
// } from 'phosphor-messaging';

// import {
//   IChangedArgs, Property
// } from 'phosphor-properties';

// import {
//   Signal
// } from 'phosphor-signaling';

// import {
//   Panel, ResizeMessage, Widget
// } from 'phosphor-widget';

// import {
//   StackedPanel
// } from '../../lib/index';


// class LogPanel extends StackedPanel {

//   messages: string[] = [];

//   processMessage(msg: Message): void {
//     super.processMessage(msg);
//     this.messages.push(msg.type);
//   }
// }


// class LogWidget extends Widget {

//   messages: string[] = [];

//   processMessage(msg: Message): void {
//     super.processMessage(msg);
//     this.messages.push(msg.type);
//   }
// }


// class BaseLogPanel extends Panel {

//   messages: string[] = [];

//   processMessage(msg: Message): void {
//     super.processMessage(msg);
//     this.messages.push(msg.type);
//   }
// }


describe('phosphor-stackedpanel', () => {

  describe('stub', () => {

    it('should pass', () => {

    });

  });

  // describe('StackedPanel', () => {

  //   describe('.currentWidgetProperty', () => {

  //     it('should be a property descriptor', () => {
  //       expect(StackedPanel.currentWidgetProperty instanceof Property).to.be(true);
  //     });

  //     it('should have the name `currentWidget`', () => {
  //       expect(StackedPanel.currentWidgetProperty.name).to.be('currentWidget');
  //     });

  //     it('should default to `null`', () => {
  //       let panel = new StackedPanel();
  //       expect(StackedPanel.currentWidgetProperty.get(panel)).to.be(null);
  //     });

  //     it('should have a notify signal', () => {
  //       expect(StackedPanel.currentWidgetProperty.notify instanceof Signal).to.be(true);
  //     });

  //     it('should send a `layout-request`', () => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.addChild(widget);
  //       panel.messages = [];
  //       StackedPanel.currentWidgetProperty.set(panel, widget);
  //       expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //     });

  //   });

  //   describe('#constructor()', () => {

  //     it('should accept no arguments', () => {
  //       let panel = new StackedPanel();
  //       expect(panel instanceof StackedPanel).to.be(true);
  //     });

  //     it('should add the `p-StackedPanel` class', () => {
  //       let panel = new StackedPanel();
  //       expect(panel.hasClass('p-StackedPanel')).to.be(true)
  //     });

  //   });

  //   describe('#currentWidget', () => {

  //     it('should be `null` if there are no widgets', () => {
  //       let panel = new StackedPanel();
  //       expect(panel.currentWidget).to.be(null);
  //     });

  //     it('should be equal to the current widget', () => {
  //       let panel = new StackedPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       expect(panel.currentWidget).to.be(null);
  //       panel.currentWidget = widget0;
  //       expect(panel.currentWidget).to.be(widget0);
  //       panel.addChild(widget1);
  //       expect(panel.currentWidget).to.be(widget0);
  //       panel.currentWidget = widget1;
  //       expect(panel.currentWidget).to.be(widget1);
  //     });

  //     it('should be a pure delegate to the `currentWidgetProperty`', () => {
  //       let panel = new StackedPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       panel.addChild(widget1);
  //       panel.currentWidget = widget0;
  //       expect(StackedPanel.currentWidgetProperty.get(panel)).to.be(widget0);
  //       StackedPanel.currentWidgetProperty.set(panel, widget1);
  //       expect(panel.currentWidget).to.be(widget1);
  //     });

  //   });

  //   describe('#currentWidgetChanged', () => {

  //     it('should be emitted when the current widget is changed', () => {
  //       let called = false;
  //       let widget = new Widget();
  //       let panel = new StackedPanel();
  //       panel.currentWidgetChanged.connect(() => { called = true; });
  //       panel.addChild(widget);
  //       panel.currentWidget = widget;
  //       expect(called).to.be(true);
  //     });

  //     it('should emit the correct changed args', () => {
  //       let panel = new StackedPanel();
  //       let sender: StackedPanel = null;
  //       let args: IChangedArgs<Widget> = null;
  //       panel.currentWidgetChanged.connect((s, a) => { sender = s; args = a; });

  //       let widget0 = new Widget();
  //       panel.addChild(widget0);
  //       expect(sender).to.be(null);
  //       expect(args).to.be(null);
  //       panel.currentWidget = widget0;

  //       expect(sender).to.be(panel);
  //       expect(args).to.eql({
  //         name: 'currentWidget',
  //         oldValue: null,
  //         newValue: widget0,
  //       });

  //       sender = null;
  //       args = null;

  //       let widget1 = new Widget();
  //       panel.addChild(widget1);
  //       expect(sender).to.be(null);
  //       expect(args).to.be(null);

  //       panel.currentWidget = widget1;
  //       expect(sender).to.be(panel);
  //       expect(args).to.eql({
  //         name: 'currentWidget',
  //         oldValue: widget0,
  //         newValue: widget1,
  //       });
  //     });

  //     it('should emit when the current widget is removed', () => {
  //       let panel = new StackedPanel();
  //       let sender: StackedPanel = null;
  //       let args: IChangedArgs<Widget> = null;
  //       panel.currentWidgetChanged.connect((s, a) => { sender = s; args = a; });

  //       let widget = new Widget();
  //       panel.addChild(widget);
  //       panel.currentWidget = widget;

  //       sender = null;
  //       args = null;

  //       widget.remove();
  //       expect(sender).to.be(panel);
  //       expect(args).to.eql({
  //         name: 'currentWidget',
  //         oldValue: widget,
  //         newValue: null,
  //       });
  //     });
  //   });

  //   describe('#onChildAdded()', () => {

  //     it('should be invoked when a child is added', () => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(panel.messages.indexOf('child-added')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should hide the new child', () => {
  //       let panel = new StackedPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       expect(widget.hidden).to.be(false);
  //       panel.addChild(widget);
  //       expect(widget.hidden).to.be(true);
  //       panel.dispose();
  //     });

  //     it('should send `after-attach` to the child', () => {
  //       let panel = new StackedPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       expect(widget.messages.indexOf('after-attach')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onChildRemoved()', () => {

  //     it('should be invoked when a child is added', () => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       widget.remove();
  //       expect(panel.messages.indexOf('child-removed')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should send `before-detach` to the child', () => {
  //       let panel = new StackedPanel();
  //       let widget = new LogWidget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       widget.remove();
  //       expect(widget.messages.indexOf('before-detach')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onChildMoved()', () => {

  //     it('should be invoked when a child is moved', () => {
  //       let panel = new LogPanel();
  //       let widget0 = new Widget();
  //       let widget1 = new Widget();
  //       panel.addChild(widget0);
  //       panel.addChild(widget1);
  //       panel.addChild(widget0);
  //       expect(panel.messages.indexOf('child-moved')).to.not.be(-1);
  //     });

  //   });

  //   describe('#onAfterShow()', () => {

  //     it('should be invoked after the panel is shown', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       panel.hidden = true;
  //       panel.messages = [];
  //       panel.hidden = false;
  //       expect(panel.messages.indexOf('after-show')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should send an `update-request`', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       panel.hidden = true;
  //       panel.messages = [];
  //       panel.hidden = false;
  //       expect(panel.messages.indexOf('update-request')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onAfterAttach()', () => {

  //     it('should be invoked after the panel is attached', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       expect(panel.messages.indexOf('after-attach')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should post a `layout-request`', (done) => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       expect(panel.messages.indexOf('layout-request')).to.be(-1);
  //       requestAnimationFrame(() => {
  //         expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //         panel.dispose();
  //         done();
  //       });
  //     });

  //   });

  //   describe('#onResize()', () => {

  //     it('should be invoked on a `resize` message', () => {
  //       let panel = new LogPanel();
  //       let message = new ResizeMessage(100, 100);
  //       panel.attach(document.body);
  //       sendMessage(panel, message);
  //       expect(panel.messages.indexOf('resize')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should handle an unknown size', () => {
  //       let panel = new LogPanel();
  //       panel.attach(document.body);
  //       sendMessage(panel, ResizeMessage.UnknownSize);
  //       expect(panel.messages.indexOf('resize')).to.not.be(-1);
  //       panel.dispose();
  //     });

  //     it('should resize the current widget', () => {
  //       let panel = new StackedPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       panel.currentWidget = widget;
  //       panel.node.style.position = 'absolute';
  //       panel.node.style.top = '0px';
  //       panel.node.style.left = '0px';
  //       panel.node.style.width = '0px';
  //       panel.node.style.height = '0px';
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       panel.node.style.width = '100px';
  //       panel.node.style.height = '100px';
  //       sendMessage(panel, new ResizeMessage(100, 100));
  //       expect(widget.node.offsetTop).to.be(0);
  //       expect(widget.node.offsetLeft).to.be(0);
  //       expect(widget.node.offsetWidth).to.be(100);
  //       expect(widget.node.offsetHeight).to.be(100);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onUpdateRequest()', () => {

  //     it('should be invoked on an `update-request` message', () => {
  //       let panel = new LogPanel();
  //       sendMessage(panel, Widget.MsgUpdateRequest);
  //       expect(panel.messages.indexOf('update-request')).to.not.be(-1);
  //     });

  //     it('should resize the current widget', () => {
  //       let panel = new LogPanel();
  //       let widget = new Widget();
  //       panel.attach(document.body);
  //       panel.addChild(widget);
  //       panel.currentWidget = widget;
  //       panel.node.style.position = 'absolute';
  //       panel.node.style.top = '0px';
  //       panel.node.style.left = '0px';
  //       panel.node.style.width = '0px';
  //       panel.node.style.height = '0px';
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       panel.node.style.width = '100px';
  //       panel.node.style.height = '100px';
  //       sendMessage(panel, Widget.MsgUpdateRequest);
  //       expect(widget.node.offsetTop).to.be(0);
  //       expect(widget.node.offsetLeft).to.be(0);
  //       expect(widget.node.offsetWidth).to.be(100);
  //       expect(widget.node.offsetHeight).to.be(100);
  //       panel.dispose();
  //     });

  //   });

  //   describe('#onLayoutRequest()', () => {

  //     it('should be invoked on a `layout-request` message', () => {
  //       let panel = new LogPanel();
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       expect(panel.messages.indexOf('layout-request')).to.not.be(-1);
  //     });

  //     it('should send a `layout-request` to its parent', () => {
  //       let panel1 = new BaseLogPanel();
  //       let panel2 = new StackedPanel();
  //       panel1.addChild(panel2);
  //       panel1.attach(document.body);
  //       clearMessageData(panel1);
  //       clearMessageData(panel2);
  //       expect(panel1.messages.indexOf('layout-request')).to.be(-1);
  //       sendMessage(panel2, Widget.MsgLayoutRequest);
  //       expect(panel1.messages.indexOf('layout-request')).to.not.be(-1);
  //       panel1.dispose();
  //     });

  //     it('should setup the geometry of the panel', () => {
  //       let panel = new StackedPanel();
  //       let child = new Widget();
  //       child.node.style.minWidth = '50px';
  //       child.node.style.minHeight = '50px';
  //       panel.addChild(child);
  //       panel.currentWidget = child;
  //       panel.attach(document.body);
  //       expect(panel.node.style.minWidth).to.be('');
  //       expect(panel.node.style.minHeight).to.be('');
  //       sendMessage(panel, Widget.MsgLayoutRequest);
  //       expect(panel.node.style.minWidth).to.be('50px');
  //       expect(panel.node.style.minHeight).to.be('50px');
  //       panel.dispose();
  //     });

  //   });

  // });

});
