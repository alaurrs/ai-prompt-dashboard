import {Component, ElementRef, EventEmitter, Output, ViewChild, ViewEncapsulation, HostListener, Input, AfterViewInit} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {Button} from 'primeng/button';

@Component({
  selector: 'app-chat-composer',
  standalone: true,
  templateUrl: './chat-composer.component.html',
  styleUrl: './chat-composer.component.scss',
  imports: [
    FormsModule,
    Button
  ],
  encapsulation: ViewEncapsulation.None
})
export class ChatComposerComponent implements AfterViewInit {
  @Input() streaming = false;
  @Output() send = new EventEmitter<string>();
  @Output() stop = new EventEmitter<void>();
  @Output() heightChange = new EventEmitter<number>();
  text = '';
  @ViewChild('ta') ta!: ElementRef<HTMLTextAreaElement>;
  @ViewChild('pill') pill!: ElementRef<HTMLElement>;

  ngAfterViewInit() {
    queueMicrotask(() => this.autosize());
  }

  onSend() {
    const v = this.text.trim();
    if (!v) return;
    this.send.emit(v);
    this.text = '';
    this.autosize();
  }

  onStop() {
    this.stop.emit();
  }

  onInput() {
    this.autosize();
  }

  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        return;
      }
      e.preventDefault();
      this.onSend();
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.autosize();
  }

  private autosize() {
    if (!this.ta) return;
    const el = this.ta.nativeElement;
    const max = 180;
    el.style.height = 'auto';
    const next = Math.min(el.scrollHeight, max);
    el.style.height = next + 'px';
    el.style.overflowY = el.scrollHeight > max ? 'auto' : 'hidden';
    if (this.pill?.nativeElement) {
      const h = this.pill.nativeElement.getBoundingClientRect().height;
      this.heightChange.emit(Math.round(h));
    }
  }
}
