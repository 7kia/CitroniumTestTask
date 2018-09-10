/**
 * Created by Илья on 25.08.2018.
 */
import * as React from "react";
import Footer from "./Footer/index";
import PageContent from "./PageContent/index";
import TopPanel from "./TopPanel/index";
import If from "tsx-control-statements";

interface IProps {
  title: string;
  haveTopPanel: boolean;
  haveFooter: boolean;
}

class Base extends React.Component<IProps> {
  constructor(props: IProps) {
    super(props);
  }

  public render() {
    return (
      <div>
        <If condition={this.props.haveTopPanel}>
          <TopPanel />
        </If>
        <PageContent />
        <If condition={this.props.haveFooter}>
          <Footer />
        </If>
      </div>
    );
  }
}

export default Base;
