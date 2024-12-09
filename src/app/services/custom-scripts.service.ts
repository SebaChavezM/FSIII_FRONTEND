import { Injectable } from '@angular/core';

declare var AOS: any;
declare var GLightbox: any;
declare var Swiper: any;

@Injectable({
  providedIn: 'root',
})
export class CustomScriptsService {
  constructor() {}

  toggleScrolled(): void {
    const body = document.querySelector('body');
    const header = document.querySelector('#header');
    if (
      !header?.classList.contains('scroll-up-sticky') &&
      !header?.classList.contains('sticky-top') &&
      !header?.classList.contains('fixed-top')
    )
      return;

    const scrolled = window.scrollY > 100;
    body?.classList.toggle('scrolled', scrolled);
  }

  initializeToggleScrolled(): void {
    document.addEventListener('scroll', this.toggleScrolled.bind(this));
    window.addEventListener('load', this.toggleScrolled.bind(this));
  }

  mobileNavToggle(): void {
    const body = document.querySelector('body');
    const mobileNavToggleBtn = document.querySelector('.mobile-nav-toggle');
    if (!mobileNavToggleBtn) return;

    mobileNavToggleBtn.addEventListener('click', () => {
      body?.classList.toggle('mobile-nav-active');
      mobileNavToggleBtn.classList.toggle('bi-list');
      mobileNavToggleBtn.classList.toggle('bi-x');
    });
  }

  initializeAOS(): void {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 600,
        easing: 'ease-in-out',
        once: true,
        mirror: false,
      });
    } else {
      console.warn('AOS library is not loaded.');
    }
  }

  initializeGLightbox(): void {
    if (typeof GLightbox !== 'undefined') {
      GLightbox({
        selector: '.glightbox',
      });
    } else {
      console.warn('GLightbox library is not loaded.');
    }
  }

  toggleFAQs(): void {
    const faqItems = document.querySelectorAll('.faq-item h3, .faq-item .faq-toggle');
    faqItems.forEach((faqItem) => {
      faqItem.addEventListener('click', () => {
        faqItem.parentElement?.classList.toggle('faq-active');
      });
    });
  }

  initializeSwiper(): void {
    if (typeof Swiper !== 'undefined') {
      const swipers = document.querySelectorAll('.init-swiper');
      swipers.forEach((swiperElement) => {
        const configElement = swiperElement.querySelector('.swiper-config');
        if (!configElement) return;

        const config = JSON.parse(configElement.textContent || '{}');
        new Swiper(swiperElement as HTMLElement, config);
      });
    } else {
      console.warn('Swiper library is not loaded.');
    }
  }
}
