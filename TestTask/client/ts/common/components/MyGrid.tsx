import * as React from "react";

interface IMyGridProps {
  items: JSX.Element[];
  columnAmount: number;
  rowAmount: number;
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

  public render(): JSX.Element {
    const gridElements: JSX.Element[] = MyGrid.generateGridElements(this.props.items);
    return (
      <div className="grid-container">
          {gridElements}
      </div>
    );
  }

}

export default MyGrid;
