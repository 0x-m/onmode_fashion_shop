const tag_box_template = document.createElement('template');
tag_box_template.innerHTML = `
<style>
    :host {
        display: block;
    }
    #container {
        display: flex;
        overflow-x: auto;
        border-bottom: 1px solid gray;
        position; relative;
        padding:0;

    }

    .tag {
        font-size: 0.9rem;
        width:fit-content;
        word-wrap: normal;
        word-break: keep-all;
        color:white;
        background-color: rgb(248, 90, 90);
        border-radius: 6px;
        display:flex;
        margin-right: 0.3rem;
        margin-bottom: 0.1rem;
        display: flex;
        justify-content: space-between;
        alin-items: center;
        padding:0.3rem;
        transition: 0.5s all;
        
    }

    .showup {
     animation-name: ss;
     animation-duration: 0.5s;
     animation-timing-function: cubic-bezier(0.175, 0.885, 0.32, 1.275);
     animation-fill-mode: forward;
    }

    @keyframes ss {
        0% { transform: scale(0);}
        100% { transform: scale(1);}
    }

    .cross {
        font-size: 1rem;
        font-weight: bold;
        display: block;
        color:white;
        margin-right:0.3rem;
        cursor: pointer;
    }
    .cross:hover {
        transform: scale(1.2);
    }

    #tags {
        display: flex;
        justify-content: space-between;
        padding:0.3rem;
    }

    #text {
        width: 80%;
        min-width: 30%;
        appearance: none;
        outline: none;
        border:none;
        font-size: 1rem;
        vertical-align: middle;
        min-height:100%;
        color: gray;
        padding-right: 0.3rem;
    }

    #text::placeholder { 
        color: #aaa;
    }
</style>
<div part="container" id="container">
    <div part="tags" id="tags"></div>
    <input  part="text" type="text" id="text" />
</div>
`;


class TagBox extends HTMLElement {

    static getObservedAttributes(){
        return ['placeholder'];
    }

    get placeholder() {
        return this.getAttribute('placeholder');
    }

    set placehodler(value){
        this.shadowRoot.querySelector('#text').placehodler = value;
    }

    get tags() {
        return this._tags;
    }
    get max_allowed() {
        return this.max_num_tags;
    }

    set max_allowed(value) {
        const n = this.getAttribute('max_allowed');
        if (parseInt(n)) {
            this.setAttribute('max_allowed', n)
        }
    }
    constructor() {
        super();
        this.max_num_tags = 10;
        this.count = 0;
        this._tags = new Map;
        this.attachShadow({ mode: 'open'});
        this.shadowRoot.appendChild(tag_box_template.content.cloneNode(true));

    }

    attributeChangedCallback(name, oldval, newval) {
        if (oldval == newval) 
            return;

        switch(name) {
            case 'max_allowed':
                this.max_num_tags = newval
                break;
        }
    }

    connectedCallback() {
        this.shadowRoot.querySelector('#text').placeholder = this.getAttribute('placeholder');
        this._delete_tag = this._delete_tag.bind(this);
        this._add_tag = this._add_tag.bind(this);
        this._handle_key_down = this._handle_key_down.bind(this);
        this.shadowRoot.querySelector('#text').addEventListener('keypress', this._handle_key_down );
    }

    _handle_key_down(e) {
        const target = e.target;
        if (e.code == 'Space') {
            const  tag_txt = target.value.trim();
            if (tag_txt == '')
                return;
            this._add_tag(tag_txt);
            e.target.value = ''; //wipe textbox-
        }
        
    }

    _delete_tag(e) {
        const tag_id = parseInt(e.target.dataset['id']);
        this._tags.delete(tag_id);
        const p = e.target.parentNode;
        const an = e.target.parentNode.animate([
                {transform: 'scale(0.7) rotate(20deg)'},
                {transform: 'scale(0) rotate(360deg)'}
            ],{
                duration: 300,
                easing: 'cubic-bezier(0.175, 0.885, 0.32, 1)'
            });
        an.onfinish = (function(d) {
            return function() {
                d.remove();
            }
        })(p);
        if (this._tags.size == 0){
           const tx = this.shadowRoot.querySelector('#text');
           tx.value = tx.value.trim(); 
        }

    }
    _set_placeholder(txt) {
        this.shadowRoot.querySelector('#text').placeholder = txt;
    }

    _add_tag(txt) {
        if (this._tags.size >= this.max_num_tags) 
            return;
        const tag = document.createElement('div');
        const span = document.createElement('span');
        const cross = document.createElement('span');
        cross.className = 'cross';
        cross.innerText = '\u00D7';
        span.innerText = txt;
        tag.appendChild(span);
        tag.appendChild(cross);
        tag.className = 'tag';
        cross.dataset['id'] = this.count;
        cross.addEventListener('click', this._delete_tag);
        this.shadowRoot.querySelector('#tags').appendChild(tag);
        this._tags.set(this.count, txt);
        tag.classList.add('showup');
        this.count +=1;

    }

}

customElements.define('tag-box', TagBox);