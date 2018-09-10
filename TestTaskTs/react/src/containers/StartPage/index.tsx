/**
 * Created by Илья on 05.09.2018.
 */
/**
 * Created by Илья on 25.08.2018.
 */
import * as React from "react";
import TopPanel from "../TopPanel/index";
import Footer from "../Footer/index";

// interface IProps {
// 	title: string;
// }
// <IProps>

class StartPage extends React.Component {
  // constructor(props: IProps) {
  // 	super(props);
  // }

  public render() {
    return (
      <div>
        <TopPanel />
        <h1>Start page</h1>
        <Footer />
      </div>
    );
  }
}

export default StartPage;
