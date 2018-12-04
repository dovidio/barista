import { async, TestBed, fakeAsync, flush, ComponentFixture, inject, tick, flushMicrotasks } from '@angular/core/testing';
import { DtSelectionAreaModule, DtIconModule } from '@dynatrace/angular-components';
import { Component, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { DtButtonModule } from '../button';
import { dispatchMouseEvent, dispatchKeyboardEvent } from '../../testing/dispatch-events';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DtSelectionArea } from './selection-area';
import { tickRequestAnimationFrame } from '../../testing/request-animation-frame';
import { OverlayContainer } from '@angular/cdk/overlay';
import { ENTER, TAB, LEFT_ARROW, UP_ARROW, DOWN_ARROW, RIGHT_ARROW, PAGE_DOWN, PAGE_UP, HOME, END } from '@angular/cdk/keycodes';

fdescribe('DtSelectionArea', () => {

  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        DtSelectionAreaModule,
        DtButtonModule,
        HttpClientTestingModule,
        DtIconModule.forRoot({svgIconLocation: `{{name}}.svg`}),
      ],
      declarations: [
        BasicTest,
        BasicTestWithInitialTabIndex,
      ],
    });

    TestBed.compileComponents();

    inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    })();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  describe('origin', () => {
    it('should make the origin tabable when a selection area is attached and the element has no tabindex', () => {
      const fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      const origin = fixture.componentInstance.origin;
      expect(origin.nativeElement.getAttribute('tabindex')).toBeDefined();
    });
    it('should not change the tabindex on the origin if it was already', () => {
      const fixture = TestBed.createComponent(BasicTestWithInitialTabIndex);
      fixture.detectChanges();
      const origin = fixture.componentInstance.origin;
      expect(origin.nativeElement.getAttribute('tabindex')).toBe('10');
    });
    it('should position the selection-area over to the origin', () => {
      const fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      const origin = fixture.componentInstance.origin;
      const originDomRect = origin.nativeElement.getBoundingClientRect();
      const selectionArea = fixture.debugElement.query(By.directive(DtSelectionArea)).nativeElement;
      expect(selectionArea.style.left).toEqual(`${originDomRect.left}px`);
      expect(selectionArea.style.top).toEqual(`${originDomRect.top}px`);
      expect(selectionArea.style.width).toEqual(`${originDomRect.width}px`);
      expect(selectionArea.style.height).toEqual(`${originDomRect.height}px`);
    });
  });

  describe('creation', () => {
    let fixture: ComponentFixture<any>;
    let origin: HTMLElement;

    beforeEach(() => {
      fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      origin = fixture.componentInstance.origin.nativeElement;
    });

    it('should create the selection area at the mouseposition', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 100, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.left).toEqual('90px');
    }));

    it('should scale the selection area on mousemove', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 100, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 200, 10);
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.left).toEqual('90px');
      expect(box.nativeElement.style.width).toEqual('100px');
    }));

    it('should scale the selection area correctly when the mouse is moved to the left of the creation point', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 200, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 100, 10);
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.right).toEqual('210px');
      expect(box.nativeElement.style.width).toEqual('100px');
    }));

    it('should scale the selection area correctly when the mouse is moved to the left and then to the right', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 200, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 100, 10);
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 300, 10);
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.left).toEqual('190px');
      expect(box.nativeElement.style.width).toEqual('100px');
    }));

    it('should constrain the position to the origin\'s left edge', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 210, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 0, 10);
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.right).toEqual('200px');
      expect(box.nativeElement.style.width).toEqual('200px');
    }));

    it('should constrain the position to the origin\'s right edge', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 20, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 420, 10);
      flush();
      tickRequestAnimationFrame();
      const box = fixture.debugElement.query(By.css('.dt-selection-area-box'));
      expect(box.nativeElement.style.left).toEqual('10px');
      expect(box.nativeElement.style.width).toEqual('390px');
    }));

    it('should create an overlay on creation', fakeAsync(() => {
      dispatchMouseEvent(origin, 'mousedown', 100, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 200, 10);
      flush();
      tickRequestAnimationFrame();
      const overlayNative = overlayContainerElement.querySelector('.dt-selection-area-overlay-pane');
      expect(overlayNative).not.toBeNull();
    }));
  });

  describe('mouse interaction', () => {
    let fixture: ComponentFixture<BasicTest>;
    let origin: HTMLElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      origin = fixture.componentInstance.origin.nativeElement;

      dispatchMouseEvent(origin, 'mousedown', 110, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 210, 10);
      flush();
      tickRequestAnimationFrame();
      dispatchMouseEvent(window, 'mouseup');
      flush();
      tickRequestAnimationFrame();
    }));

    describe('on the box', () => {
      let boxNative: HTMLElement;

      beforeEach(fakeAsync(() => {
         boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        // position after this creation
        // left 100
        // width 100
        //     box
        //  | ----- |
        // 100     200
      }));

      it('should move the box 100px to the right', fakeAsync(() => {
        dispatchMouseEvent(boxNative, 'mousedown', 150, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 250, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('200px');
        expect(boxNative.style.width).toEqual('100px');
      }));

      it('should move the box 50px to the left', fakeAsync(() => {
        dispatchMouseEvent(boxNative, 'mousedown', 150, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 100, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('50px');
        expect(boxNative.style.width).toEqual('100px');
      }));

      it('should constrain the box to the origin', fakeAsync(() => {
        dispatchMouseEvent(boxNative, 'mousedown', 150, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        // move the mouse to the edge of the window
        dispatchMouseEvent(window, 'mousemove', 0, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('0px');
        expect(boxNative.style.width).toEqual('100px');

        // move the mouse over the edge of the origin
        dispatchMouseEvent(window, 'mousemove', 420, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('300px');
        expect(boxNative.style.width).toEqual('100px');
      }));
    });

    describe('on the left handle', () => {
      let handleNative: HTMLButtonElement;
      beforeEach(fakeAsync(() => {
        handleNative = fixture.debugElement.query(By.css('.dt-selection-area-handle-left')).nativeElement;

        // box position after this creation inside the host
        // left 100
        // width 100
        //     box
        //  | ----- |
        // 100     200
      }));

      it('should move the handle 25px to the left', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 110, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 85, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.right).toEqual('200px');
        expect(boxNative.style.width).toEqual('125px');
      }));

      it('should move the handle 50px to the right but not over the right handle', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 110, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 160, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.right).toEqual('200px');
        expect(boxNative.style.left).toEqual('');
        expect(boxNative.style.width).toEqual('50px');
      }));

      it('should move the handle 150px to the right so over the right handle', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 110, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 260, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('200px');
        expect(boxNative.style.width).toEqual('50px');
      }));
    });

    describe('on the right handle', () => {
      let handleNative: HTMLButtonElement;
      beforeEach(fakeAsync(() => {
        handleNative = fixture.debugElement.query(By.css('.dt-selection-area-handle-right')).nativeElement;

        // box position after this creation inside the host
        // left 100
        // width 100
        //     box
        //  | ----- |
        // 100     200
      }));

      it('should move the handle 50px to the right', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 210, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 260, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.right).toEqual('');
        expect(boxNative.style.width).toEqual('150px');
      }));

      it('should move the handle 50 to the left but not over the left handle', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 210, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 160, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('50px');
      }));

      it('should move the handle 150 to the left, so over the left handle', fakeAsync(() => {
        let boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        dispatchMouseEvent(handleNative, 'mousedown', 210, 10);
        fixture.detectChanges();
        flush();
        tickRequestAnimationFrame();
        dispatchMouseEvent(window, 'mousemove', 60, 10);
        flush();
        tickRequestAnimationFrame();
        boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
        expect(boxNative.style.right).toEqual('300px');
        expect(boxNative.style.width).toEqual('50px');
      }));
    });
  });

  describe('keyboard interaction', () => {
    let fixture: ComponentFixture<BasicTest>;
    let origin: HTMLElement;
    let boxNative: HTMLDivElement;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      origin = fixture.componentInstance.origin.nativeElement;
      dispatchKeyboardEvent(origin, 'keydown', ENTER);
      flush();
      fixture.detectChanges();
      boxNative = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
    }));

    it('should create the box on ENTER', () => {
      expect(boxNative.style.left).toEqual('100px');
      expect(boxNative.style.width).toEqual('200px');
    });

    describe('on the box', () => {

      it('should move the box to the left when LEFT_ARROW or UP_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', LEFT_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('99px');

        dispatchKeyboardEvent(boxNative, 'keydown', UP_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('98px');
      }));

      it('should move the box to the right when DOWN_ARROW or RIGHT_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', RIGHT_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('101px');

        dispatchKeyboardEvent(boxNative, 'keydown', DOWN_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('102px');
      }));

      it('should move the box 10px to the left when PAGE_UP is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', PAGE_UP);
        flush();
        expect(boxNative.style.left).toEqual('90px');
      }));

      it('should move the box 10px to the left when PAGE_DOWN is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', PAGE_DOWN);
        flush();
        expect(boxNative.style.left).toEqual('110px');
      }));

      it('should move the box to start when HOME is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', HOME);
        flush();
        expect(boxNative.style.left).toEqual('0px');
      }));

      it('should move the box to start when END is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(boxNative, 'keydown', END);
        flush();
        expect(boxNative.style.left).toEqual('200px');
      }));
    });

    describe('on the left-handle', () => {
      let leftHandle;

      beforeEach(() => {
        leftHandle = fixture.debugElement.query(By.css('.dt-selection-area-handle-left')).nativeElement;
      });

      it('should move it to the left when LEFT_ARROW or UP_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', LEFT_ARROW);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('201px');

        dispatchKeyboardEvent(leftHandle, 'keydown', UP_ARROW);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('202px');
      }));

      it('should move it to the right when DOWN_ARROW or RIGHT_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', RIGHT_ARROW);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('199px');

        dispatchKeyboardEvent(leftHandle, 'keydown', DOWN_ARROW);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('198px');
      }));

      it('should move it 10px to the left when PAGE_UP is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', PAGE_UP);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('210px');
      }));

      it('should move the box 10px to the left when PAGE_DOWN is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', PAGE_DOWN);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('190px');
      }));

      it('should move the box to start when HOME is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', HOME);
        flush();
        expect(boxNative.style.right).toEqual('100px');
        expect(boxNative.style.width).toEqual('300px');
      }));

      it('should move the box to start when END is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(leftHandle, 'keydown', END);
        flush();
        expect(boxNative.style.left).toEqual('300px');
        expect(boxNative.style.width).toEqual('100px');
      }));
    });

    describe('on the right-handle', () => {
      let rightHandle;

      beforeEach(() => {
        rightHandle = fixture.debugElement.query(By.css('.dt-selection-area-handle-right')).nativeElement;
      });

      it('should move it to the left when LEFT_ARROW or UP_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', LEFT_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('199px');

        dispatchKeyboardEvent(rightHandle, 'keydown', UP_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('198px');
      }));

      it('should move it to the right when DOWN_ARROW or RIGHT_ARROW is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', RIGHT_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('201px');

        dispatchKeyboardEvent(rightHandle, 'keydown', DOWN_ARROW);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('202px');
      }));

      it('should move it 10px to the left when PAGE_UP is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', PAGE_UP);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('190px');
      }));

      it('should move the box 10px to the left when PAGE_DOWN is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', PAGE_DOWN);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('210px');
      }));

      it('should move the box to start when HOME is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', HOME);
        flush();
        expect(boxNative.style.right).toEqual('300px');
        expect(boxNative.style.width).toEqual('100px');
      }));

      it('should move the box to start when END is pressed', fakeAsync(() => {
        dispatchKeyboardEvent(rightHandle, 'keydown', END);
        flush();
        expect(boxNative.style.left).toEqual('100px');
        expect(boxNative.style.width).toEqual('300px');
      }));
    });

  });

  describe('overlay', () => {
    let fixture: ComponentFixture<BasicTest>;
    let origin: HTMLElement;
    let box: HTMLElement;
    let closeButton: HTMLButtonElement | null;

    beforeEach(fakeAsync(() => {
      fixture = TestBed.createComponent(BasicTest);
      fixture.detectChanges();
      origin = fixture.componentInstance.origin.nativeElement;
      dispatchMouseEvent(origin, 'mousedown', 100, 10);
      fixture.detectChanges();
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mousemove', 200, 10);
      flush();
      tickRequestAnimationFrame();

      dispatchMouseEvent(window, 'mouseup');

      fixture.detectChanges();
      box = fixture.debugElement.query(By.css('.dt-selection-area-box')).nativeElement;
      closeButton = overlayContainerElement.querySelector('.dt-selection-area-close button');
    }));

    it('should dismiss the overlay and hide the box when closed', fakeAsync(() => {
      expect(closeButton).not.toBeNull();
      closeButton!.click();
      fixture.detectChanges();
      expect(overlayContainerElement.children.length).toBe(0);
      expect(box.style.visibility).toBe('hidden');
    }));

    it('should fire a closed event when closing by clicking the button', fakeAsync(() => {
      const selectionArea = fixture.debugElement.query(By.directive(DtSelectionArea)).componentInstance;
      const closeSpy = jasmine.createSpy('onCloseObservable');

      selectionArea.closed.subscribe(closeSpy);
      expect(closeSpy).not.toHaveBeenCalled();
      closeButton!.click();
      fixture.detectChanges();
      expect(closeSpy).toHaveBeenCalledTimes(1);
    }));

    it('should fire a closed event when closing programmatically', fakeAsync(() => {
      const selectionArea: DtSelectionArea = fixture.debugElement.query(By.directive(DtSelectionArea)).componentInstance;
      const closeSpy = jasmine.createSpy('onCloseObservable');

      selectionArea.closed.subscribe(closeSpy);
      expect(closeSpy).not.toHaveBeenCalled();
      selectionArea.close();
      fixture.detectChanges();
      expect(closeSpy).toHaveBeenCalledTimes(1);
    }));
  });
});

@Component({
  template: `
  <div class="origin" #origin [dtSelectionArea]="area"></div>
  <dt-selection-area #area="dtSelectionArea">
    Some basic overlay content 
    <dt-selection-area-actions>
      <button dt-button>Zoom in</button>
    </dt-selection-area-actions>
  </dt-selection-area>
  `,
  styles: [
    'body { margin: 10px; }',
    '.origin { width: 400px; height: 400px; }',
  ],
  encapsulation: ViewEncapsulation.None,
})
export class BasicTest {
  @ViewChild('origin') origin: ElementRef;
}

@Component({
  template: `
  <div class="origin" #origin [dtSelectionArea]="area" tabindex="10"></div>
  <dt-selection-area #area="dtSelectionArea">
    Some basic overlay content 
  </dt-selection-area>
  `,
})
export class BasicTestWithInitialTabIndex {
  @ViewChild('origin') origin: ElementRef;
}
