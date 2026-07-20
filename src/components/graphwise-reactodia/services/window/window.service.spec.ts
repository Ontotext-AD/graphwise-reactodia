import {WindowService} from './window.service';

describe('WindowService', () => {
  test('getWindow returns the global window', () => {
    // When the window is requested
    // Then the global window is returned
    expect(new WindowService().getWindow()).toBe(window);
  });
});
