import * as React from "react";

interface IMyTimerProps {
  milliseconds: number;
}

class MyTimer extends React.Component<IMyTimerProps, {}> {
  constructor(props: IMyTimerProps) {
    super(props);
  }

  private static getTimeToSeconds(milliseconds: number): number {
    return Math.floor(milliseconds / 1000);
  }

  private static getTimeToMinutes(milliseconds: number): number {
    return Math.floor(MyTimer.getTimeToSeconds(milliseconds) / 60);
  }

  public render(): JSX.Element {
    const milliseconds: number = this.props.milliseconds;
    const seconds: number = MyTimer.getTimeToSeconds(milliseconds);
    const minutes: number = MyTimer.getTimeToMinutes(milliseconds);
    return (
      <div className="timer">
        {minutes} : {Math.floor(seconds) - minutes * 60}
      </div>
    );
  }
}

export default MyTimer;