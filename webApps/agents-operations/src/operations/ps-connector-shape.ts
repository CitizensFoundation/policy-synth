import { dia, shapes, util, V } from '@joint/core';

export class ConnectorShapeView extends dia.ElementView {
  render() {
    super.render();

    const htmlMarkup = this.model.get('markup');

    let foreignObjectWidth = 90;
    let foreignObjectHeight = 40;

    // Create a foreignObject with a set size and style
    const foreignObject = V('foreignObject', {
      width: foreignObjectWidth,
      height: foreignObjectHeight,
      style: 'overflow: visible; display: block;',
    }).node;

    // Append the foreignObject to this.el
    V(this.el).append(foreignObject);

    // Defer the addition of the inner div with the HTML content
    setTimeout(() => {
      const div = document.createElement('div');
      div.setAttribute('class', 'html-element');
      div.setAttribute('xmlns', 'http://www.w3.org/1999/xhtml');

      div.innerHTML = `<ps-connector-node
        agentId="${this.model.attributes.agentId}"
        >
      </ps-connector-node>`;

      // Append the div to the foreignObject
      foreignObject.appendChild(div);

      // Force layout recalculation and repaint
      foreignObject.getBoundingClientRect();
    }, 0); // A timeout of 0 ms defers the execution until the browser has finished other processing

    this.update();
    return this;
  }
}

export class ConnectorShape extends shapes.standard.Rectangle {
  defaults() {
    return util.deepSupplement(
      {
        type: 'html.ConnectorShape',
        attrs: {},
        markup: '<div></div>',
      },
      shapes.standard.Rectangle.prototype.defaults
    );
  }

  view = ConnectorShapeView;
}
