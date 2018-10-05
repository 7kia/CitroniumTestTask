"use strict";

import * as React from "react";
import {Button, ListGroupItem, Media} from "react-bootstrap";
import {MyDictionary} from "../../../consts/types";

interface IGameItemProps {
    game: MyDictionary;
    redirectToGame: (gameId: number) => void;
}

class GameItem extends React.Component<IGameItemProps, {}> {
    constructor(props: IGameItemProps) {
        super(props);
    }

    private redirectToGame: () => void = () => {
        this.props.redirectToGame(this.props.game.id);
    };

    public render(): JSX.Element {
        return (
          <ListGroupItem className="pv-sm mb-sm" bsStyle="info" key={this.props.game.id}>
              <Media>
                  <Media.Left>

                  </Media.Left>
                  <Media.Body componentClass="vam">
                      <Button
                        className="float-right"
                        bsStyle="primary"
                        bsSize="lg"
                        onClick={this.redirectToGame}
                      >
                          Cancel
                      </Button>
                  </Media.Body>
              </Media>

          </ListGroupItem>
        );
    }
};

export default GameItem;
