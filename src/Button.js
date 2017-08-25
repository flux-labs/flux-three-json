import React, { Component } from 'react';
import './Button.css';

class Button extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if (!this._span) return;
        this._span.addEventListener('click', this.props.callback);
    }
    componentWillUnmount() {
        this._span.removeEventListener('click', this.props.callback);
    }

    // Need to use hooks to update listeners when component updates to a different instance
    componentWillUpdate() {
        this._span.removeEventListener('click', this.props.callback);
    }
    componentDidUpdate() {
        this._span.addEventListener('click', this.props.callback);
    }

    render() {
        return (
            <span className='button' ref={(span)=>{this._span=span;}}>{this.props.label}</span>
        );
    }
}

export default Button;
