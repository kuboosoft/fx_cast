/* tslint:disable:max-line-length */
"use strict";

import React, { Component } from "react";
import ReactDOM from "react-dom";

import defaultOptions, { Options } from "../../defaultOptions";

import { ReceiverSelectorManagerType } from "../../receiverSelectorManager";

import Bridge from "./Bridge";
import EditableList from "./EditableList";

import getBridgeInfo, { BridgeInfo } from "../../lib/getBridgeInfo";
import options from "../../lib/options";
import { REMOTE_MATCH_PATTERN_REGEX } from "../../lib/utils";


const _ = browser.i18n.getMessage;

// macOS styles
browser.runtime.getPlatformInfo()
    .then(platformInfo => {
        if (platformInfo.os === "mac") {
            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = "styles/mac.css";
            document.head.appendChild(link);
        }
    });


function getInputValue (input: HTMLInputElement) {
    switch (input.type) {
        case "checkbox": {
            return input.checked;
        }
        case "number": {
            return parseFloat(input.value);
        }

        default:
            return input.value;
    }
}


interface OptionsAppState {
    hasLoaded: boolean;
    options: Options;
    bridgeInfo: BridgeInfo;
    platform: string;
    bridgeLoading: boolean;
    isFormValid: boolean;
    hasSaved: boolean;
}

class OptionsApp extends Component<{}, OptionsAppState> {
    private form: HTMLFormElement;

    constructor (props: {}) {
        super(props);

        this.state = {
            hasLoaded: false
          , options: null
          , bridgeInfo: null
          , platform: null
          , bridgeLoading: true
          , isFormValid: true
          , hasSaved: false
        };

        this.handleReset = this.handleReset.bind(this);
        this.handleFormSubmit = this.handleFormSubmit.bind(this);
        this.handleFormChange = this.handleFormChange.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleWhitelistChange = this.handleWhitelistChange.bind(this);

        this.getWhitelistItemPatternError
                = this.getWhitelistItemPatternError.bind(this);
    }

    public async componentDidMount () {
        this.setState({
            hasLoaded: true
          , options: await options.getAll()
        });

        const bridgeInfo = await getBridgeInfo();
        const { os } = await browser.runtime.getPlatformInfo();

        this.setState({
            bridgeInfo
          , platform: os
          , bridgeLoading: false
        });
    }

    public render () {
        if (!this.state.hasLoaded) {
            return;
        }

        return (
            <div>
                <Bridge info={ this.state.bridgeInfo }
                        platform={ this.state.platform }
                        loading={ this.state.bridgeLoading } />

                <form id="form" ref={ form => { this.form = form; }}
                        onSubmit={ this.handleFormSubmit }
                        onChange={ this.handleFormChange }>

                    <fieldset className="category">
                        <div className="category__title">
                            <h2>{ _("optionsMediaCategoryName") }</h2>
                        </div>
                        <p className="category__description">
                            { _("optionsMediaCategoryDescription") }
                        </p>

                        <div className="option">
                            <label className="option__control">
                                <input name="mediaEnabled"
                                       type="checkbox"
                                       className="checkbox"
                                       checked={ this.state.options.mediaEnabled }
                                       onChange={ this.handleInputChange } />
                                { _("optionsMediaEnabled") }
                            </label>
                        </div>

                        <div className="option">
                            <label className="option__control">
                                <input name="mediaSyncElement"
                                       type="checkbox"
                                       className="checkbox"
                                       checked={ this.state.options.mediaSyncElement }
                                       onChange={ this.handleInputChange } />
                                { _("optionsMediaSyncElement") }
                            </label>
                        </div>

                        <div className="option">
                            <label className="option__control">
                                <input name="mediaStopOnUnload"
                                       type="checkbox"
                                       className="checkbox"
                                       checked={ this.state.options.mediaStopOnUnload }
                                       onChange={ this.handleInputChange } />
                                { _("optionsMediaStopOnUnload") }
                            </label>
                        </div>


                        <fieldset className="category"
                                  disabled={ !this.state.options.mediaEnabled }>
                            <div className="category__title">
                                <h3>{ _("optionsLocalMediaCategoryName") }</h3>
                            </div>

                            <div className="option">
                                <label className="option__control">
                                    <input name="localMediaEnabled"
                                           type="checkbox"
                                           className="checkbox"
                                           checked={ this.state.options.localMediaEnabled }
                                           onChange={ this.handleInputChange } />
                                    { _("optionsLocalMediaEnabled") }
                                </label>
                                <div className="option__description indent">
                                    { _("optionsLocalMediaCategoryDescription") }
                                </div>
                            </div>

                            <div className="option">
                                <label className="option__control">
                                    { _("optionsLocalMediaServerPort") }
                                    <input name="localMediaServerPort"
                                           type="number"
                                           className="field"
                                           required
                                           min="1025"
                                           max="65535"
                                           value={ this.state.options.localMediaServerPort }
                                           onChange={ this.handleInputChange } />
                                </label>
                            </div>
                        </fieldset>
                    </fieldset>

                    <fieldset className="category">
                        <div className="category__title">
                            <h2>{ _("optionsMirroringCategoryName") }</h2>
                        </div>
                        <p className="category__description">
                            { _("optionsMirroringCategoryDescription") }
                        </p>

                        <div className="option">
                            <label className="option__control">
                                <input name="mirroringEnabled"
                                       type="checkbox"
                                       className="checkbox"
                                       checked={ this.state.options.mirroringEnabled }
                                       onChange={ this.handleInputChange } />
                                { _("optionsMirroringEnabled") }
                            </label>
                        </div>

                        <div className="option">
                            <label className="option__control">
                                { _("optionsMirroringAppId") }
                                <input name="mirroringAppId"
                                       type="text"
                                       className="field"
                                       required
                                       value={ this.state.options.mirroringAppId }
                                       onChange={ this.handleInputChange } />
                            </label>
                        </div>
                    </fieldset>

                    <fieldset className="category">
                        <div className="category__title">
                            <h2>{ _("optionsReceiverSelectorCategoryName") }</h2>
                        </div>

                        <fieldset className="category">
                            <div className="category__title">
                                <h3>{ _("optionsReceiverSelectorTypeCategoryName") }</h3>
                            </div>

                            <div className="radio-cards">
                                <label className="option card radio-card"
                                       htmlFor="receiverSelector1">
                                    <label className="option__control radio">
                                        <input name="receiverSelector"
                                               type="radio"
                                               id="receiverSelector1"
                                               value={ ReceiverSelectorManagerType.Popup }
                                               checked={ this.state.options.receiverSelector === ReceiverSelectorManagerType.Popup }
                                               onChange={ this.handleInputChange } />
                                        { _("optionsReceiverSelectorTypePopup") }
                                    </label>
                                    <div className="option__description indent">
                                        { _("optionsReceiverSelectorTypePopupDescription") }
                                    </div>

                                    <div className="option indent">
                                        <label className="option__control checkbox">
                                            <input type="checkbox" checked />
                                            { _("optionsReceiverSelectorTypePopupUsePhotonTheme") }
                                        </label>
                                        <div className="option__description indent">
                                            { _("optionsReceiverSelectorTypePopupUsePhotonThemeDescription") }
                                        </div>
                                    </div>
                                </label>
                                <label className="option card radio-card radio-card--selected">
                                    <label className="option__control radio"
                                           htmlFor="receiverSelector2">
                                        <input name="receiverSelector"
                                               type="radio"
                                               id="receiverSelector2"
                                               value={ ReceiverSelectorManagerType.NativeMac }
                                               checked={ this.state.options.receiverSelector === ReceiverSelectorManagerType.NativeMac }
                                               onChange={ this.handleInputChange } />
                                        { _("optionsReceiverSelectorTypeNative") }
                                    </label>
                                    <div className="option__description indent">
                                        { _("optionsReceiverSelectorTypeNativeDescription") }
                                    </div>
                                </label>
                            </div>
                        </fieldset>
                    </fieldset>

                    <fieldset className="category">
                        <div className="category__title">
                            <h2>{ _("optionsUserAgentWhitelistCategoryName") }</h2>
                        </div>
                        <p className="category__description">
                            { _("optionsUserAgentWhitelistCategoryDescription") }
                        </p>

                        <div className="option">
                            <label className="option__control">
                                <input name="userAgentWhitelistEnabled"
                                       type="checkbox"
                                       className="checkbox"
                                       checked={ this.state.options.userAgentWhitelistEnabled }
                                       onChange={ this.handleInputChange } />
                                { _("optionsUserAgentWhitelistEnabled") }
                            </label>
                        </div>

                        <div className="option">
                            <EditableList data={ this.state.options.userAgentWhitelist }
                                          onChange={ this.handleWhitelistChange }
                                          itemPattern={ REMOTE_MATCH_PATTERN_REGEX }
                                          itemPatternError={ this.getWhitelistItemPatternError } />
                        </div>
                    </fieldset>

                    <div id="buttons">
                        <div id="status-line">
                            { this.state.hasSaved && _("optionsSaved") }
                        </div>
                        <button onClick={ this.handleReset }
                                type="button"
                                className="button">
                            { _("optionsReset") }
                        </button>
                        <button type="submit"
                                className="button button--primary"
                                disabled={ !this.state.isFormValid }>
                            { _("optionsSave") }
                        </button>
                    </div>
                </form>
            </div>
        );
    }


    private handleReset () {
        this.setState({
            options: { ...defaultOptions }
        });
    }

    private async handleFormSubmit (ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        this.form.reportValidity();

        try {
            const oldOpts = await options.getAll();
            await options.setAll(this.state.options);

            const alteredOptions = [];
            for (const [ key, val ] of Object.entries(this.state.options)) {
                const oldVal = oldOpts[key];
                if (oldVal !== val) {
                    alteredOptions.push(key);
                }
            }

            this.setState({
                hasSaved: true
            }, () => {
                window.setTimeout(() => {
                    this.setState({
                        hasSaved: false
                    });
                }, 1000);
            });

            // Send update message / event
            browser.runtime.sendMessage({
                subject: "optionsUpdated"
              , data: { alteredOptions }
            });
        } catch (err) {
            console.error("Failed to save options");
        }
    }

    private handleFormChange (ev: React.FormEvent<HTMLFormElement>) {
        ev.preventDefault();

        this.setState({
            isFormValid: this.form.checkValidity()
        });
    }

    private handleInputChange (ev: React.ChangeEvent<HTMLInputElement>) {
        const { target } = ev;

        console.log(ev, getInputValue(target));

        this.setState(currentState => {
            currentState.options[target.name] = getInputValue(target);
            return currentState;
        });
    }

    private handleWhitelistChange (whitelist: string[]) {
        this.setState(currentState => {
            currentState.options.userAgentWhitelist = whitelist;
            return currentState;
        });
    }

    private getWhitelistItemPatternError (info: string): string {
        return _("optionsUserAgentWhitelistInvalidMatchPattern", info);
    }

    private async updateBridgeInfo () {
        this.setState({
            bridgeLoading: true
        });

        const bridgeInfo = await getBridgeInfo();

        this.setState({
            bridgeInfo
          , bridgeLoading: false
        });
    }
}


ReactDOM.render(
    <OptionsApp />
  , document.querySelector("#root"));
