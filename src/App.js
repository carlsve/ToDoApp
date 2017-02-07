import React, { Component } from 'react';
import * as firebase from 'firebase';

class App extends Component {
    constructor(props) {
        super(props);

        let user = firebase.auth().currentUser;

        console.log(!!user);

        this.state = {
            items: [],
            filteringSelection: "SHOWUNFINISHEDONLY",
            userNotLoggedInShowSignUpOrSignInTab: "SHOWSIGNINCOMPONENT",
            loadingFinished: false,
            isLoggedIn: !!user
        };

        //This might have to be used, not sure...
        this.addItem = this.addItem.bind(this);
        this.removeItem = this.removeItem.bind(this);
        this.completeItem = this.completeItem.bind(this);
        this.filterItems = this.filterItems.bind(this);
        this.signInOrSignUpTabHandler = this.signInOrSignUpTabHandler.bind(this);
        this.signUp = this.signUp.bind(this);
        this.signIn = this.signIn.bind(this);
        this.signOut = this.signOut.bind(this);
    }

    componentDidMount() {
        console.log("App successfully loaded.");

        firebase.auth().onAuthStateChanged(user => {
            if (user) {
                this.setState({
                    isLoggedIn: true
                });

                const rootRef = firebase.database().ref().child('todolist/' + user.uid);

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
        });


    }

    addItem(item) {
        let userid = firebase.auth().currentUser.uid;
        firebase.database().ref('todolist/' + userid).push(item);
    }

    removeItem(item) {
        let userid = firebase.auth().currentUser.uid;
        firebase.database().ref('todolist/' + userid + '/' + item.firebasekey).remove();
    }

    completeItem(item) {
        let userid = firebase.auth().currentUser.uid;

        item.completed = !item.completed;
        firebase.database().ref('todolist/' + userid + '/' + item.firebasekey).update(item);
    }

    filterItems(status) {
        this.setState({ filteringSelection: status });
    }

    signInOrSignUpTabHandler(status) {
        this.setState({ userNotLoggedInShowSignUpOrSignInTab: status });
    }

    signIn(signInItem) {

        firebase.auth().signInWithEmailAndPassword(signInItem.email, signInItem.password).catch((error) => {
            console.log(error);
        });
    }

    signUp(signUpItem) {
        console.log(signUpItem);
        firebase.auth().createUserWithEmailAndPassword(signUpItem.email, signUpItem.password).then(result => {
            this.signIn(signUpItem);
        }).catch((error) => {
            console.log(error);
        });
    }

    signOut() {

        firebase.auth().signOut().then(() => {
            console.log("success!");
            this.setState({
                isLoggedIn: false
            });
        }, (error) => {
            console.log(error);
        });

    }

    render() {
        return (
            <div className="body">
                <NavBarComponent signOut={this.signOut} isLoggedIn={this.state.isLoggedIn} />
                {this.state.isLoggedIn ? <UserLoggedInApp addItem={this.addItem}
                                                          filterItems={this.filterItems}
                                                          filteringSelection={this.state.filteringSelection}
                                                          removeItem={this.removeItem}
                                                          completeItem={this.completeItem}
                                                          items={this.state.items}
                                                          loadingFinished={this.state.loadingFinished} />

                    : <UserNotLoggedInApp signUp={this.signUp}
                                          signIn={this.signIn}
                                          userNotLoggedInShowSignUpOrSignInTab={this.state.userNotLoggedInShowSignUpOrSignInTab}
                                          signInOrSignUpTabHandler={this.signInOrSignUpTabHandler} />}
                <FooterComponent />
            </div>
        );
    }
}

class SignInComponent extends Component {

    constructor(props) {
        super(props);

        this.signIn = this.signIn.bind(this);
    }

    signIn(e) {
        e.preventDefault();

        let signInItem = {
            email: this.refs.email.value,
            password: this.refs.password.value
        };

        if (typeof signInItem.email === 'string' && signInItem.email.length > 0) {

            this.refs.signInForm.reset();

            this.props.signIn({
                email: signInItem.email,
                password: signInItem.password
            });
        }
    }

    render() {
        return(
            <div className="container box">
                <h1 className="title">Sign in!</h1>
                <form ref="signInForm" onSubmit={this.signIn}>
                    <p className="control is-expanded">
                        <input className="input" type="text" ref="email" placeholder="email" />
                    </p>
                    <p className="control is-expanded">
                        <input className="input" type="password" ref="password" placeholder="password" />
                    </p>
                    <p className="control">
                        <button className="button is-primary" type="submit">Sign in</button>
                    </p>
                </form>
            </div>
        );
    }
}

class SignUpComponent extends Component {

    constructor(props) {
        super(props);

        this.signUp = this.signUp.bind(this);
    }

    signUp(e) {
        e.preventDefault();

        let signUpItem = {
            email: this.refs.email.value,
            password: this.refs.password.value,
            confirmPassword: this.refs.passwordConfirm.value
        };

        if(typeof signUpItem.email === 'string' && signUpItem.email.length > 0) {

            this.refs.signUpForm.reset();

            if (signUpItem.confirmPassword === signUpItem.password) {
                this.props.signUp({
                    email: signUpItem.email,
                    password: signUpItem.password
                });
            }
        }
    }

    render() {
        return(
            <div className="container box">
                <h1 className="title">Sign up!</h1>
                <form ref="signUpForm" onSubmit={this.signUp}>
                    <p className="control is-expanded">
                        <input className="input" type="text" ref="email" placeholder="email" />
                    </p>
                    <p className="control is-expanded">
                        <input className="input" type="password" ref="password" placeholder="password" />
                    </p>
                    <p className="control is-expanded">
                        <input className="input" type="password" ref="passwordConfirm" placeholder="confirm password" />
                    </p>
                    <p className="control">
                        <button className="button is-primary" type="submit">Sign up</button>
                    </p>
                </form>
            </div>
        );
    }
}


class UserNotLoggedInApp extends Component {
    render() {
        return (
            <div className="section">
                <div className="container box">
                    <p className="has-text-centered">You are currently not logged in</p>
                    <div className="tabs is-centered">
                        <ul>
                            <li className={this.props.userNotLoggedInShowSignUpOrSignInTab === "SHOWSIGNINCOMPONENT" ? "is-active" : ""}>
                                <a onClick={() => this.props.signInOrSignUpTabHandler("SHOWSIGNINCOMPONENT")}>Sign in</a></li>
                            <li className={this.props.userNotLoggedInShowSignUpOrSignInTab === "SHOWSIGNUPCOMPONENT" ? "is-active" : ""}>
                                <a onClick={() => this.props.signInOrSignUpTabHandler("SHOWSIGNUPCOMPONENT")}>Sign up</a></li>
                        </ul>
                    </div>
                    {this.props.userNotLoggedInShowSignUpOrSignInTab === "SHOWSIGNUPCOMPONENT" ? <SignUpComponent signUp={this.props.signUp} /> : <SignInComponent signIn={this.props.signIn} />}
                </div>
            </div>
        )
    }
}

class UserLoggedInApp extends Component {
    render() {
        return (
            <div className="section">
                <div className="container">
                    <div className="logo">
                        <a className="title is-1" href="#">To Do List</a>
                    </div>
                    <AddItemForm addItem={this.props.addItem} />
                    <FilterItemButton filterItems={this.props.filterItems} filteringSelection={this.props.filteringSelection} />
                    {this.props.loadingFinished ?
                        <ItemList removeItem={this.props.removeItem} completeItem={this.props.completeItem} items={this.props.items} filteringSelection={this.props.filteringSelection} />
                        : <div className="section">
                            <p className="title is-2">Loading content... <a className="button is-primary is-loading">Loading</a></p>
                        </div> }
                </div>

            </div>
        );
    }
}

class NavBarComponent extends Component {

    render() {
        return (
            <nav className="nav has-shadow">
                <div className="container">
                    <div className="nav-left">
                        <a className="nav-item">
                            <img src="http://bulma.io/images/bulma-logo.png" alt="Bulma logo" />
                        </a>
                        <a className="nav-item is-tab is-hidden-mobile is-active">Home</a>
                        <a className="nav-item is-tab is-hidden-mobile">Contact</a>
                    </div>
                    <span className="nav-toggle"></span>
                    <div className="nav-right nav-menu">
                        <a className="nav-item is-tab is-hidden-tablet is-active">Home</a>
                        <a className="nav-item is-tab is-hidden-tablet">Contact</a>
                        {this.props.isLoggedIn ? <a onClick={this.props.signOut} className="nav-item is-tab">Sign out</a>
                            : ""}
                    </div>
                </div>
            </nav>
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

    render() {
        return (
            <div className="tabs is-centered">
                <ul>
                    <li className={this.props.filteringSelection === "SHOWUNFINISHEDONLY" ? "is-active" : ""}><a onClick={() => this.props.filterItems("SHOWUNFINISHEDONLY")}>Show unfinished only</a></li>
                    <li className={this.props.filteringSelection === "SHOWFINISHEDONLY" ? "is-active" : ""}><a onClick={() => this.props.filterItems("SHOWFINISHEDONLY")}>Show finished only</a></li>
                    <li className={this.props.filteringSelection === "SHOWALL" ? "is-active" : ""}><a onClick={() => this.props.filterItems("SHOWALL")}>Show all</a></li>
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
                        {   this.props.filteringSelection === 'SHOWUNFINISHEDONLY' ? this.props.items.filter(item => !item.completed).map(item => {
                                return <Item removeItem={this.props.removeItem} completeItem={this.props.completeItem} key={item.firebasekey} item={item} /> })
                            : this.props.filteringSelection === 'SHOWFINISHEDONLY' ? this.props.items.filter(item => item.completed).map(item => {
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