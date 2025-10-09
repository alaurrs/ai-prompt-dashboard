import { ChangeDetectionStrategy, Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-right-panel',
  templateUrl: './right-panel.component.html',
  styleUrl: './right-panel.component.scss',
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RightPanelComponent {
  @Input({ transform: (v: any) => !!v }) open = false;
  @Output() close = new EventEmitter<void>();

  onBackdrop() {
    this.close.emit();
  }

  // Optional close on Escape
  @HostListener('document:keydown.escape')
  handleEscape() {
    if (this.open) this.close.emit();
  }
}
