/** Gradual light on the hero photograph, with no image swaps or layout changes. */
if (!customElements.get('osso-scroll-lamp')) {
  customElements.define('osso-scroll-lamp', class extends HTMLElement {
    connectedCallback() {
      if (!this.querySelector('[data-lamp-light]')) return;
      this.motion = window.matchMedia('(prefers-reduced-motion: reduce)');
      this.schedule = () => {
        if (this.frame) return;
        this.frame = requestAnimationFrame(() => {
          this.frame = 0;
          this.updateLight();
        });
      };
      this.onMotion = () => {
        window.removeEventListener('scroll', this.schedule);
        if (!this.motion.matches) window.addEventListener('scroll', this.schedule, { passive: true });
        this.schedule();
      };
      this.motion.addEventListener('change', this.onMotion);
      window.addEventListener('resize', this.schedule, { passive: true });
      this.onMotion();
    }

    updateLight() {
      if (this.motion.matches) {
        this.style.setProperty('--lamp-light', '0');
        return;
      }
      const rect = this.getBoundingClientRect();
      const viewport = window.innerHeight;
      const start = Math.max(0, rect.top + window.scrollY - viewport * 0.68);
      const distance = Math.max(1, Math.min(rect.height * 0.55, viewport * 0.45));
      const progress = Math.min(1, Math.max(0, (window.scrollY - start) / distance));
      // Smoothstep makes both ends gentle while staying directly tied to scroll.
      this.style.setProperty('--lamp-light', (progress * progress * (3 - 2 * progress)).toFixed(3));
    }

    disconnectedCallback() {
      if (!this.schedule) return;
      cancelAnimationFrame(this.frame);
      window.removeEventListener('scroll', this.schedule);
      window.removeEventListener('resize', this.schedule);
      this.motion.removeEventListener('change', this.onMotion);
    }
  });
}
