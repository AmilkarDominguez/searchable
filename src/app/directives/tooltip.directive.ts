import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnDestroy,
  Renderer2,
} from '@angular/core';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective implements OnDestroy {
  @Input('appTooltip') tooltipText = '';

  private tooltipEl: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter')
  onMouseEnter(): void {
    this.show();
  }

  @HostListener('mouseleave')
  onMouseLeave(): void {
    this.hide();
  }

  private show(): void {
    if (!this.tooltipText || this.tooltipEl) return;

    this.tooltipEl = this.renderer.createElement('div');
    this.renderer.addClass(this.tooltipEl, 'app-tooltip');
    this.renderer.setProperty(this.tooltipEl, 'textContent', this.tooltipText);
    this.renderer.appendChild(document.body, this.tooltipEl);

    // Position after render so we can measure tooltip size
    requestAnimationFrame(() => this.updatePosition());
  }

  private updatePosition(): void {
    if (!this.tooltipEl) return;

    const hostRect = this.el.nativeElement.getBoundingClientRect();
    const tipRect = this.tooltipEl.getBoundingClientRect();
    const gap = 10; // px gap between tooltip arrow and element

    const top = hostRect.top + window.scrollY - tipRect.height - gap;
    const left =
      hostRect.left + window.scrollX + hostRect.width / 2 - tipRect.width / 2;

    this.renderer.setStyle(this.tooltipEl, 'top', `${top}px`);
    this.renderer.setStyle(this.tooltipEl, 'left', `${left}px`);
  }

  private hide(): void {
    if (this.tooltipEl) {
      this.renderer.removeChild(document.body, this.tooltipEl);
      this.tooltipEl = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
