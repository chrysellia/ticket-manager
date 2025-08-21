import { Controller } from '@hotwired/stimulus';

/*
 * This is an example Stimulus controller with TypeScript!
 *
 * Any element with a data-controller="hello" attribute will cause
 * this controller to be executed. The name "hello" comes from the filename:
 * hello_controller.ts -> "hello"
 */
export default class extends Controller {
    connect(): void {
        this.element.textContent = 'Hello Stimulus! Edit me in assets/js/controllers/hello_controller.ts';
    }
}
