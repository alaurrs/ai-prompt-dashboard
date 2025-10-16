import {
  Directive, ElementRef, Input, OnDestroy, OnInit, inject, Signal, effect
} from '@angular/core';
import { fromEvent } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
  selector: '[appAutoScroll]',
  standalone: true,
})
export class AutoScrollDirective implements OnInit, OnDestroy {
  private el = inject(ElementRef<HTMLElement>);
  private destroyRef = takeUntilDestroyed();

  @Input() followWhileStreaming?: Signal<boolean>;

  @Input() bottomThreshold = 24;

  @Input() smooth = 0;

  private userLocked = false;
  private mo?: MutationObserver;

  ngOnInit() {
    const host = this.el.nativeElement;

    fromEvent(host, 'scroll')
      .pipe(this.destroyRef)
      .subscribe(() => {
        const atBottom = this.isAtBottom();
        this.userLocked = !atBottom;
      });

    this.mo = new MutationObserver(() => this.maybeScroll());
    this.mo.observe(host, {
      childList: true,
      characterData: true,
      subtree: true,
    });

    if (this.followWhileStreaming) {
      effect(() => {
        const streaming = this.followWhileStreaming!();
        if (streaming && !this.userLocked) {
          this.scrollToBottom();
        }
      });
    }

    queueMicrotask(() => this.scrollToBottom(true));
  }

  ngOnDestroy() {
    this.mo?.disconnect();
  }

  private isAtBottom(): boolean {
    const el = this.el.nativeElement;
    return el.scrollHeight - (el.scrollTop + el.clientHeight) <= this.bottomThreshold;
  }

  private maybeScroll() {
    const streaming = this.followWhileStreaming ? this.followWhileStreaming() : true;
    if (!this.userLocked || streaming) {
      if (this.userLocked && streaming) return;
      this.scrollToBottom();
    }
  }

  private scrollToBottom(immediate = false) {
    const el = this.el.nativeElement;
    const doScroll = () => {
      if (this.smooth > 0 && !immediate) {
        el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' as ScrollBehavior });
      } else {
        el.scrollTop = el.scrollHeight;
      }
    };
    requestAnimationFrame(doScroll);
  }
}
