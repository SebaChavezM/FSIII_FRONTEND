import { TestBed } from '@angular/core/testing';
import { CustomScriptsService } from './custom-scripts.service';

describe('CustomScriptsService', () => {
  let service: CustomScriptsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomScriptsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should toggle scrolled class based on scroll position', () => {
    const body = document.createElement('body');
    const header = document.createElement('header');
    header.id = 'header';
    header.classList.add('scroll-up-sticky');
    document.body.appendChild(body);
    document.body.appendChild(header);

    spyOnProperty(window, 'scrollY', 'get').and.returnValue(150);

    service.toggleScrolled();

    expect(body.classList.contains('scrolled')).toBeTrue();
  });

  it('should warn if AOS is not defined', () => {
    spyOn(console, 'warn');
    (window as any).AOS = undefined;

    service.initializeAOS();

    expect(console.warn).toHaveBeenCalledWith('AOS library is not loaded.');
  });

  it('should initialize GLightbox when defined', () => {
    const mockGLightbox = jasmine.createSpy('GLightbox');
    (window as any).GLightbox = mockGLightbox;

    service.initializeGLightbox();

    expect(mockGLightbox).toHaveBeenCalledWith({ selector: '.glightbox' });
  });

  it('should warn if GLightbox is not defined', () => {
    spyOn(console, 'warn');
    (window as any).GLightbox = undefined;

    service.initializeGLightbox();

    expect(console.warn).toHaveBeenCalledWith('GLightbox library is not loaded.');
  });

  it('should toggle FAQ active state', () => {
    const faqItem = document.createElement('div');
    faqItem.classList.add('faq-item');
    const faqToggle = document.createElement('h3');
    faqItem.appendChild(faqToggle);
    document.body.appendChild(faqItem);

    service.toggleFAQs();

    faqToggle.click();
    expect(faqItem.classList.contains('faq-active')).toBeTrue();
  });

  it('should warn if Swiper is not defined', () => {
    spyOn(console, 'warn');
    (window as any).Swiper = undefined;

    service.initializeSwiper();

    expect(console.warn).toHaveBeenCalledWith('Swiper library is not loaded.');
  });

  it('should initialize Swiper when defined', () => {
    const mockSwiper = jasmine.createSpy('Swiper');
    (window as any).Swiper = mockSwiper;

    const swiperElement = document.createElement('div');
    swiperElement.classList.add('init-swiper');
    const configElement = document.createElement('div');
    configElement.classList.add('swiper-config');
    configElement.textContent = JSON.stringify({ loop: true });
    swiperElement.appendChild(configElement);
    document.body.appendChild(swiperElement);

    service.initializeSwiper();

    expect(mockSwiper).toHaveBeenCalledWith(swiperElement, { loop: true });
  });
});
