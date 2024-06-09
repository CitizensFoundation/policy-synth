import { dia, shapes, util, V } from '@joint/core';
export class AgentsShapeView extends dia.ElementView {
    render() {
        super.render();
        const htmlMarkup = this.model.get('markup');
        //TODO: Make TS work here
        const nodeType = this.model.attributes.nodeType;
        let foreignObjectWidth = 200;
        let foreignObjectHeight = 230;
        if (nodeType === 'connector') {
            foreignObjectWidth = 140;
            foreignObjectHeight = 180;
        }
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
            if (nodeType === 'agent') {
                div.innerHTML = `<ps-agent-node
          agentId="${this.model.attributes.agentId}"
        >
     </ps-agent-node>`;
                div.className = 'agentContainer';
                if (this.model.attributes.agentId == "2") {
                    div.className += ' agentContainerRunning';
                }
            }
            else {
                div.innerHTML = `<ps-connector-node
          connectorId="${this.model.attributes.connectorId}"
        >
      </ps-connector-node>`;
                div.className = 'connectorContainer';
            }
            // Append the div to the foreignObject
            foreignObject.appendChild(div);
            // Force layout recalculation and repaint
            foreignObject.getBoundingClientRect();
        }, 0); // A timeout of 0 ms defers the execution until the browser has finished other processing
        this.update();
        return this;
    }
}
export class AgentShape extends shapes.standard.Rectangle {
    constructor() {
        super(...arguments);
        this.view = AgentsShapeView;
    }
    defaults() {
        return util.deepSupplement({
            type: 'html.AgentShape',
            attrs: {},
            markup: '<div></div>',
        }, shapes.standard.Rectangle.prototype.defaults);
    }
}
//# sourceMappingURL=ps-agent-shape.js.map