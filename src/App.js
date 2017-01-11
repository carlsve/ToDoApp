import React, { Component } from 'react';
import * as firebase from 'firebase';


class App extends Component {
    constructor(props) {
        super(props);

        this.state = {
            items: [],
            filterItems: "SHOWUNFINISHEDONLY",
            loadingFinished: false
        };

        //This might have to be used, not sure...
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.completeItem = this.completeItem.bind(this);
        this.filterItems = this.filterItems.bind(this);
    }

    componentDidMount() {
        console.log("App successfully loaded.");
        const rootRef = firebase.database().ref().child('todolist/items');

        rootRef.on('value', snap => {
            let tempItems = [];

            snap.forEach(item => {
                tempItems.push(item.val());
                tempItems[tempItems.length - 1].firebasekey = item.key;
            });
            tempItems.reverse();

            this.setState({ items: tempItems, loadingFinished: true });
        });
    }

    addItem(item) {
        firebase.database().ref('todolist/items').push(item);
    }

    removeItem(item) {
        firebase.database().ref('todolist/items/' + item.firebasekey).remove();
    }

    completeItem(item) {

        item.completed = !item.completed;
        firebase.database().ref('todolist/items/' + item.firebasekey).update(item);
    }

    filterItems(status) {
        this.setState({ filterItems: status });
    }

    render() {
        return (
            <div className="container">
                <div className="box">
                    <div className="logo">
                        <a className="title is-1" href="#">To Do List</a>
                    </div>
                    <AddItemForm addItem={this.addItem} />
                    <FilterItemButton filterItems={this.filterItems} filteringSelection={this.state.filterItems} />
                    {this.state.loadingFinished ?
                    <ItemList removeItem={this.removeItem} completeItem={this.completeItem} items={this.state.items} filterItems={this.state.filterItems} />
                        : <div className="section">
                            <p className="title is-2">Loading content... <a className="button is-primary is-loading">Loading</a></p>
                        </div> }
                </div>
                <FooterComponent />
            </div>
        );
    }
}

class FooterComponent extends Component {
    render() {
        return (
            <footer className="footer">
                <div className="container">
                    <div className="content has-text-centered">
                        <p>
                            <strong>To do app written in react, with firebase and bulma.css</strong> by <a href="https://karlpet.github.io">Carl Petter Svensson</a>. The source code is licensed
                            <a href="http://opensource.org/licenses/mit-license.php">MIT</a>. The website content
                            is licensed <a href="http://creativecommons.org/licenses/by-nc-sa/4.0/">CC ANS 4.0</a>.
                        </p>
                    </div>
                </div>
            </footer>
        )
    }
}

class FilterItemButton extends Component {
    constructor(props) {
        super(props);

        this.state = {
            filteringSelection: this.props.filteringSelection
        };

        console.log(this.state.filteringSelection);

        this.handleFilterItemsCheckBox = this.handleFilterItemsCheckBox.bind(this);
    }

    handleFilterItemsCheckBox(status) {
        this.props.filterItems(status);
        this.setState({ filteringSelection: status })
    }

    render() {
        return (
            <div className="tabs is-centered">
                <ul>
                    <li className={this.state.filteringSelection === "SHOWUNFINISHEDONLY" ? "is-active" : ""}><a onClick={() => this.handleFilterItemsCheckBox("SHOWUNFINISHEDONLY")}>Show unfinished only</a></li>
                    <li className={this.state.filteringSelection === "SHOWFINISHEDONLY" ? "is-active" : ""}><a onClick={() => this.handleFilterItemsCheckBox("SHOWFINISHEDONLY")}>Show finished only</a></li>
                    <li className={this.state.filteringSelection === "SHOWALL" ? "is-active" : ""}><a onClick={() => this.handleFilterItemsCheckBox("SHOWALL")}>Show all</a></li>
                </ul>
            </div>
        );
    }
}

/*<div className="section">
 <form ref="filterItemsCheckBox">
 <input className="checkbox" type="checkbox" onChange={this.handleFilterItemsCheckBox} /> Show only unfinished
 </form>
 </div>*/

/*ItemList contains a <ul> list of items,
 * listing depends on filterItems state variable of Boolean type in parent component App's state
 * if filterItems is true, only show unfinished todoitems
 * else, show all todoitems
 *
 * state: none
 *
 * props:
 * - removeItem - function, sent to each Item that is created from the list of items, handles removing item.
 * - completeItem - function, sent to eace Item that is created from the list of items, handles changing "completed" Boolean state of item.
 * - items - Array of objects of type { title: String, completed: Boolean }, gets mapped to a <li> tag in an unordered list, depends on filterItems
 * - filterItems - Boolean, if true then only show unfinished todoitems, else then show all todoitems
 *
 * functions: none
 *
 * */
class ItemList extends Component {
    render() {
        /*We use a condition with ternary operator to check if completed items should be filtered out before filling list*/
        return (
            <div className="section">
                <div className="status-list">
                    <ul>
                        {   this.props.filterItems === 'SHOWUNFINISHEDONLY' ? this.props.items.filter(item => !item.completed).map(item => {
                                return <Item removeItem={this.props.removeItem} completeItem={this.props.completeItem} key={item.firebasekey} item={item} /> })
                            : this.props.filterItems === 'SHOWFINISHEDONLY' ? this.props.items.filter(item => item.completed).map(item => {
                                return <Item removeItem={this.props.removeItem} completeItem={this.props.completeItem} key={item.firebasekey} item={item} />})
                                    : this.props.items.map(item => {
                                        return <Item removeItem={this.props.removeItem} completeItem={this.props.completeItem} key={item.firebasekey} item={item} />})
                        }
                    </ul>
                </div>
            </div>
        );
    }
}


class Item extends Component {
    constructor(props) {
        super(props);

        this.handleRemoveItem = this.handleRemoveItem.bind(this);
        this.handleCompleteItem = this.handleCompleteItem.bind(this);
    }

    handleRemoveItem() {
        this.props.removeItem(this.props.item);
    }

    handleCompleteItem() {
        this.props.completeItem(this.props.item)
    }

    render() {
        return (
            <div>
                <li className={this.props.item.completed ? "message" : "message is-warning"}  >
                    <div className="message-header">
                        {this.props.item.title}
                        <button onClick={this.handleRemoveItem} className="delete" />
                    </div>
                    <div className="message-body" onClick={this.handleCompleteItem}>
                        {this.props.item.description ? this.props.item.description
                            : ""}
                        {this.props.item.completed ?
                            <div>
                                <hr/>
                                <p className="has-text-right">completed</p>
                            </div>
                            : <div>
                                <hr/>
                                <p className="has-text-right">not completed</p>
                            </div>
                        }
                    </div>
                </li>
                <hr />
            </div>
        )
    }
}

/*
 <li className="label" ref="listItem" style={this.props.item.completed ? liStyle : {}} onClick={this.handleCompleteItem}>{this.props.item.title}</li>
 <button className="button is-danger is-small" onClick={this.handleRemoveItem}>Remove</button>
 <hr />*/

class AddItemForm extends Component {
    constructor(props) {
        super(props);
        //This might have to be used, not sure...
        this.createItem = this.createItem.bind(this);
    }

    createItem(e) {
        e.preventDefault();

        let item = {
            title: this.refs.itemTitle.value,
            description: this.refs.itemDescription.value,
            completed: false
        };

        if(typeof item.title === 'string' && item.title.length > 0) {
            this.props.addItem(item);
            this.refs.itemForm.reset();
        }
    }

    render() {
        return (
            <div>
                <form ref="itemForm" onSubmit={this.createItem}>
                    <p className="control is-expanded">
                        <input className="input" type="text" ref="itemTitle" placeholder="Title" />
                    </p>
                    <p className="control is-expanded">
                        <textarea className="textarea" ref="itemDescription" placeholder="Enter a short description here..." />
                    </p>
                    <p className="control">
                        <button className="button is-primary" type="submit">Add item</button>
                    </p>
                </form>
            </div>
        );
    }
}
/*
 <form ref="itemForm" onSubmit={this.createItem}>
 <p>Add item to todo-list:</p>
 <div className="control has-addons">
 <input className="input" type="text" placeholder="new item" ref="itemName" />
 <button className="button is-primary" type="submit">Add item</button>
 </div>
 </form>
 */
export default App;