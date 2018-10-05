"use strict";

import * as React from "react";
import SearchInput from "../../common/components/SearchInput";
import {ISearchGameData} from "../interfaces/searchGame";
import {MyDictionary} from "../../consts/types";
import {Button} from "react-bootstrap";

interface ISearchBarProps {
    onGameSearch: (
      gameData: ISearchGameData,
      updateGameList: (games: MyDictionary) => void
    ) => void;
    updateGameList: (games: MyDictionary) => void;
}

interface ISearchBarState {
    creatorName: string;
    participantName: string;
    size: string;
}

class SearchGameBar extends React.Component<ISearchBarProps, ISearchBarState> {

    constructor(props: ISearchBarProps) {
        super(props);

        this.state = {
            creatorName: "",
            participantName: "",
            size: ""
        };
    }

    private onCreatorNameChange = (e: React.FormEvent<any>) => {
        const target = (e as any).target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this.setState({ creatorName: value });
    };
    private onParticipantNameChange = (e: React.FormEvent<any>) => {
        const target = (e as any).target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this.setState({ participantName: value });
    };
    private onSizeChange = (e: React.FormEvent<any>) => {
        const target = (e as any).target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this.setState({ size: value });
    };

    private sendSearchGameData = () =>  {
        const searchData: ISearchGameData = {
            creatorName: this.state.creatorName,
            participantName: this.state.participantName,
            size: parseInt(this.state.size, 10)
        };
        this.props.onGameSearch(searchData, this.props.updateGameList);
    };

    public render(): JSX.Element {
        return (
            <div className="search-bar">
                <SearchInput
                    id="search-bar-creator-name"
                    placeholder="Creator name"
                    onChange={this.onCreatorNameChange}
                    value={this.state.creatorName}
                />
                <SearchInput
                  id="search-bar-participant-name"
                  placeholder="Participant name"
                  onChange={this.onParticipantNameChange}
                  value={this.state.participantName}
                />
                <SearchInput
                  id="search-bar-size"
                  placeholder="Size"
                  onChange={this.onSizeChange}
                  value={this.state.size}
                />
                <Button
                  className=""
                  bsStyle="primary"
                  bsSize="lg"
                  onClick={this.sendSearchGameData}
                >
                    Search
                </Button>
            </div>
        );
    }
}

export default SearchGameBar;
