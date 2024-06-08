import { dia, shapes } from '@joint/core';
export declare class ConnectorShapeView extends dia.ElementView {
    render(): this;
}
export declare class ConnectorShape extends shapes.standard.Rectangle {
    defaults(): object;
    view: typeof ConnectorShapeView;
}
//# sourceMappingURL=ps-connector-shape.d.ts.map