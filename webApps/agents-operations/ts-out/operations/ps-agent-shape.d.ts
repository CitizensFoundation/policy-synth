import { dia, shapes } from '@joint/core';
export declare class AgentsShapeView extends dia.ElementView {
    render(): this;
}
export declare class AgentShape extends shapes.standard.Rectangle {
    defaults(): object;
    view: typeof AgentsShapeView;
}
//# sourceMappingURL=ps-agent-shape.d.ts.map