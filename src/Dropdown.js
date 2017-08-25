import React, { Component } from 'react';
import './Dropdown.css';

class Dropdown extends Component {

    componentDidMount() {
        if (!this._select) return;
        this._select.addEventListener('change', this.props.callback);
    }
    componentWillUnmount() {
        this._select.removeEventListener('change', this.props.callback);
    }

    // Need to use hooks to update listeners when component updates to a different instance
    componentWillUpdate() {
        this._select.removeEventListener('change', this.props.callback);
    }
    componentDidUpdate() {
        this._select.addEventListener('change', this.props.callback);
    }

    _buildOptions() {
        return this.props.items.concat([{name:this.props.hint, id:this.props.hint}]).map((item)=>{
            return <option key={item.id} value={item.id}>{item.name}</option>
        }).reverse();
    }

    render() {
        var options = this._buildOptions();
        return (
            <select className="dropdown" ref={(select)=>{this._select=select;}}>
                {options}
            </select>
        );
    }
}

export default Dropdown;
