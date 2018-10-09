import * as React from "react";
import {CSSProperties} from "react";

interface IMyGridProps {
  items: JSX.Element[];
  columnAmount: number;
  rowAmount: number | null;
}

class MyGrid extends React.Component<IMyGridProps, {}> {
  constructor(props: IMyGridProps) {
    super(props);
  }

  private static generateGridElements(items: JSX.Element[]): JSX.Element[] {
    let gridElements: JSX.Element[] = [];
    for (let i = 0; i < items.length; i++) {
      gridElements.push(
        <div className="p-md">
          {items[i]}
        </div>,
      );
    }

    return gridElements;
  }

  private generateStyles(): CSSProperties {
    const columnAmount: number = this.props.columnAmount;
    let paddings: string = "";
    for (let i = 0; i < columnAmount; i++) {
      paddings += "auto ";
    }
    return {gridTemplateColumns: paddings};
  }

  public render(): JSX.Element {
    const gridElements: JSX.Element[] = MyGrid.generateGridElements(this.props.items);
    return (
      <div className="grid-container" style={this.generateStyles()}>
          {gridElements}
      </div>
    );
  }

}

export default MyGrid;
