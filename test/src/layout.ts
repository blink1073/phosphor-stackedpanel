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
  ChildMessage, ResizeMessage, Widget
} from 'phosphor-widget';

import {
  StackedLayout
} from '../../lib/index';


class LogLayout extends StackedLayout {

  messages: string[] = [];

  methods: string[] = [];

  processParentMessage(msg: Message): void {
    super.processParentMessage(msg);
    this.messages.push(msg.type);
  }

  protected attachChild(index: number, child: Widget): void {
    super.attachChild(index, child);
    this.methods.push('attachChild');
  }

  protected moveChild(fromIndex: number, toIndex: number, child: Widget): void {
    super.moveChild(fromIndex, toIndex, child);
    this.methods.push('moveChild');
  }

  protected detachChild(index: number, child: Widget): void {
    super.detachChild(index, child);
    this.methods.push('detachChild');
  }

  protected onAfterShow(msg: Message): void {
    super.onAfterShow(msg);
    this.methods.push('onAfterShow');
  }

  protected onAfterAttach(msg: Message): void {
     super.onAfterAttach(msg);
     this.methods.push('onAfterAttach');
  }

  protected onChildShown(msg: ChildMessage): void {
    super.onChildShown(msg);
    this.methods.push('onChildShown');
  }

  protected onChildHidden(msg: ChildMessage): void {
    super.onChildHidden(msg);
    this.methods.push('onChildHidden');
  }

  protected onResize(msg: ResizeMessage): void {
    super.onResize(msg);
    this.methods.push('onResize');
  }

  protected onUpdateRequest(msg: Message): void {
    super.onUpdateRequest(msg);
    this.methods.push('onUpdateRequest');
  }

  protected onFitRequest(msg: Message): void {
    super.onFitRequest(msg);
    this.methods.push('onFitRequest');
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

  describe('StackedLayout', () => {

    describe('#attachChild', () => {

      it("should attach a child widget to the parent's DOM node", (done) => {
        let layout = new LogLayout();
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          expect(parent.node.contains(widget0.node)).to.be(true);
          expect(parent.node.contains(widget1.node)).to.be(true);
          parent.dispose();
          done();
        });

      });

      it('should send `after-attach` to the children', (done) => {
        let layout = new LogLayout();
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          expect(widget0.messages.indexOf('after-attach')).to.not.be(-1);
          expect(widget1.messages.indexOf('after-attach')).to.not.be(-1);
          parent.dispose();
          done();
        });

      });

      it('should call fit on the parent', (done) => {
        let layout = new LogLayout();
        let widget0 = new LogWidget();
        let widget1 = new LogWidget();
        let parent = new LogWidget();
        layout.addChild(widget0);
        layout.addChild(widget1);
        parent.layout = layout;
        parent.attach(document.body);
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('attachChild')).to.not.be(-1);
          parent.messages = [];
          requestAnimationFrame(() => {
            expect(layout.messages.indexOf('fit-request')).to.not.be(-1);
            parent.dispose();
            done();
          });
        });
      });

    });

    describe('#moveChild()', () => {

      it('should send an update request to the parent', (done) => {
        let widget = new LogWidget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        children[1].messages = [];
        widget.attach(document.body);
        layout.insertChild(0, children[1]);
        expect(layout.methods.indexOf('moveChild')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('update-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#detachChild()', () => {

      it('should be called when a child is detached', () => {
        let widget = new Widget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        widget.dispose();
      });

      it("should send a `'before-detach'` message if appropriate", () => {
        let widget = new Widget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        expect(children[1].messages.indexOf('before-detach')).to.not.be(-1);
        layout.dispose();
      });

      it('should send a fit request to the parent', (done) => {
        let widget = new LogWidget();
        let children = [new LogWidget(), new LogWidget()];
        let layout = new LogLayout();
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        widget.layout = layout;
        widget.attach(document.body);
        children[1].parent = null;
        expect(layout.methods.indexOf('detachChild')).to.not.be(-1);
        layout.messages = [];
        requestAnimationFrame(() => {
          expect(layout.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onAfterShow()', () => {

      it('should call update on the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        widget.hide();
        widget.show();
        expect(layout.methods.indexOf('onAfterShow')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('update-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onAfterAttach()', () => {

      it('should call fit on the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        expect(layout.methods.indexOf('onAfterAttach')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onChildShown()', () => {

      it('should post or send fit message to the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout();
        widget.layout = layout;
        layout.addChild(new Widget());
        layout.addChild(new Widget());
        widget.attach(document.body);
        layout.childAt(0).hide();
        layout.childAt(0).show();
        expect(layout.methods.indexOf('onChildShown')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

    describe('#onChildHidden()', () => {

      it('should post or send fit message to the parent', (done) => {
        let widget = new LogWidget();
        let layout = new LogLayout();
        widget.layout = layout;
        layout.addChild(new Widget());
        layout.addChild(new Widget());
        widget.attach(document.body);
        layout.childAt(0).hide();
        expect(layout.methods.indexOf('onChildHidden')).to.not.be(-1);
        requestAnimationFrame(() => {
          expect(widget.messages.indexOf('fit-request')).to.not.be(-1);
          widget.dispose();
          done();
        });
      });

    });

     describe('#onResize()', () => {

      it('should lay out the children', () => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        sendMessage(widget, ResizeMessage.UnknownSize);
        expect(layout.methods.indexOf('onResize')).to.not.be(-1);
        expect(layout.childAt(0).node.style.zIndex).to.be('0');
        expect(layout.childAt(1).node.style.zIndex).to.be('1');
        widget.dispose();
      });

    });

    describe('#onUpdateRequest()', () => {

      it('should lay out the children', () => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        sendMessage(widget, Widget.MsgUpdateRequest);
        expect(layout.methods.indexOf('onUpdateRequest')).to.not.be(-1);
        expect(layout.childAt(0).node.style.zIndex).to.be('0');
        expect(layout.childAt(1).node.style.zIndex).to.be('1');
        widget.dispose();
      });

    });

    describe('#onFitRequest()', () => {

      it('should fit to the size required by the children', (done) => {
        let widget = new LogWidget();
        let children = [new Widget(), new Widget()];
        let layout = new LogLayout();
        widget.layout = layout;
        widget.attach(document.body);
        layout.addChild(children[0]);
        layout.addChild(children[1]);
        children[0].node.style.minWidth = '50px';
        children[0].node.style.maxWidth = '500px';
        children[1].node.style.minWidth = '100px';
        children[1].node.style.maxWidth = '400px';
        expect(widget.node.style.minHeight).to.be('');
        widget.fit();
        requestAnimationFrame(() => {
          expect(layout.methods.indexOf('onFitRequest')).to.not.be(-1);
          expect(widget.node.style.minWidth).to.be('100px');
          expect(widget.node.style.maxWidth).to.be('400px');
          widget.dispose();
          done();
        });
      });

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
