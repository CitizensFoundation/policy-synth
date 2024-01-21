# YpForm

`<yp-form>` is a wrapper around the HTML `<form>` element, that can validate and submit both custom and native HTML elements. Note that this is a breaking change from yp-form 1.0, which was a type extension.

## Properties

| Name      | Type                        | Description                                                                 |
|-----------|-----------------------------|-----------------------------------------------------------------------------|
| headers   | Record<string, string>      | HTTP request headers to send. Only works when `allowRedirect` is false.     |

## Methods

| Name             | Parameters                | Return Type | Description                                                                 |
|------------------|---------------------------|-------------|-----------------------------------------------------------------------------|
| connectedCallback|                           | void        | Lifecycle method that runs when the element is added to the DOM.            |
| disconnectedCallback|                        | void        | Lifecycle method that runs when the element is removed from the DOM.         |
| saveResetValues |                           | void        | Saves the values of all form elements for when resetting the form.           |
| validate        |                           | boolean     | Validates all the required elements in the form.                             |
| submit          | event?: CustomEvent       | void        | Submits the form.                                                           |
| reset           | event?: CustomEvent       | void        | Resets the form to the default values.                                      |
| serializeForm   |                           | Object      | Serializes the form as will be used in submission.                          |
| _makeAjaxRequest| json: Record<string, string>| Promise<void> | Makes an AJAX request with the serialized form data.                        |
| _getValidatableElements |                   | Array       | Returns all the validatable elements in the form.                           |
| _getSubmittableElements |                   | Array       | Returns all the submittable elements in the form.                           |
| _findElements   | parent: HTMLElement, ignoreName: boolean, skipSlots: boolean, submittable?: HTMLInputElement[] | Array | Finds and returns all submittable elements within the given parent. |
| _searchSubmittableInSlot | submittable: HTMLInputElement[], node: HTMLElement, ignoreName: boolean | void | Searches for submittable elements within a slot. |
| _searchSubmittable | submittable: HTMLInputElement[], node: HTMLInputElement, ignoreName: boolean | void | Searches for a submittable element. |
| _isSubmittable  | node: HTMLInputElement, ignoreName: boolean | boolean | Checks if a node is submittable. |
| _serializeElementValues | element: HTMLInputElement | Array | Serializes the values of a form element. |
| _serializeSelectValues | element: YpHTMLInputElement | Array | Serializes the values of a select element. |
| _serializeInputValues | element: HTMLInputElement | Array | Serializes the values of an input element. |
| _createHiddenElement | name: string, value: string | HTMLElement | Creates a hidden input element for submission. |
| _addSerializedElement | json: Record<string, Array<string> | string | string[] | Array<Array<string>>>, name: string, value: string | void | Adds a serialized element to the JSON object for submission. |

## Events

- **yp-form-invalid**: Fired if the form cannot be submitted because it's invalid.
- **yp-form-submit**: Fired after the form is submitted.
- **yp-form-presubmit**: Fired before the form is submitted.
- **yp-form-reset**: Fired after the form is reset.
- **yp-form-response**: Fired after the form is submitted and a response is received.
- **yp-form-error**: Fired after the form is submitted and an error is received.

## Examples

```typescript
// Example usage of the yp-form element
<yp-form
  headers='{"Content-Type": "application/json"}'
  on-yp-form-invalid="handleInvalidForm"
  on-yp-form-submit="handleSubmit"
  on-yp-form-reset="handleReset"
  on-yp-form-response="handleResponse"
  on-yp-form-error="handleError">
  <!-- form elements here -->
</yp-form>
```