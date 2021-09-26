const commentTemplat = document.createElement('template');
commentTemplat.innerHTML = `

<div class="comment">
    <h5 class="comment-author"></h5>
    <p class="comment-body"></p>
    <span class="comment-date"></span>
</div>

`;

class Comment extends HTMLElement {
    constructor() {
        super();
        this.appendChild(commentTemplat.content.cloneNode(true));
        this._render();
    }

    _render() {
        const parts = this.querySelectorAll('.comment-author, .comment-body, .comment-date');
        parts[0].textContent = this.author;
        parts[1].textContent = this.body;
        parts[2].textContent = this.date;

    }

    get body() {
        return this.getAttribute('body');
    }

    get author() {
        return this.getAttribute('author');
    }

    get date() {
        return this.getAttribute('date');
    }
}

customElements.define('om-comment', Comment);