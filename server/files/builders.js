export class ElementBuilder {
  constructor(tag) {
    this.element = document.createElement(tag);
  }

  id(id) {
    this.element.dataset.imdbID = id;
    return this;
  }

  class(clazz) {
    if (typeof clazz === 'string' && clazz.includes(' ')) {
      this.element.classList.add(...clazz.split(' ').filter(Boolean));
    } else {
      this.element.classList.add(clazz);
    }
    return this;
  }

  pluralizedText(content, array) {
    return this.text(array.length > 1 ? content + "s" : content);
  }

  text(content) {
    this.element.textContent = content;
    return this;
  }

  with(name, value) {
    this.element.setAttribute(name, value);
    return this;
  }

  listener(name, listener) {
    this.element.addEventListener(name, listener);
    return this;
  }

  append(child) {
    child.appendTo(this.element);
    return this;
  }

  appendTo(parent) {
    parent.append(this.element);
    return this.element;
  }

  insertBefore(parent, sibling) {
    parent.insertBefore(this.element, sibling);
    return this.element;
  }
}

export class ParentChildBuilder extends ElementBuilder {
  constructor(parentTag, childTag) {
    super(parentTag);
    this.childTag = childTag;
  }

  append(text) {
    const childCreator = new ElementBuilder(this.childTag).text(text);
    if (this.childClazz) {
      childCreator.class(this.childClazz);
    }

    super.append(childCreator);
  }

  childClass(childClazz) {
    this.childClazz = childClazz;
    return this;
  }

  items() {
    if (arguments.length === 1 && Array.isArray(arguments[0])) {
      arguments[0].forEach((item) => this.append(item));
    } else {
      for (var i = 0; i < arguments.length; i++) {
        this.append(arguments[i]);
      }
    }

    return this;
  }
}

class ParagraphBuilder extends ParentChildBuilder {
  constructor() {
    super("p", "span");
  }
}

class ListBuilder extends ParentChildBuilder {
  constructor() {
    super("ul", "li");
  }
}

function formatRuntime(runtime) {
  const hours = Math.trunc(runtime / 60);
  const minutes = runtime % 60;
  return hours + "h " + minutes + "m";
}

export class MovieBuilder extends ElementBuilder {
  constructor(movie, deleteMovie, isLoggedIn) {
    super("article").id(movie.imdbID);

    const figure = new ElementBuilder("figure").append(
      new ElementBuilder("img").with("src", movie.Poster).with("alt", movie.Title)
    );

    const body = new ElementBuilder("section").class("movie-body");

    const header = new ElementBuilder("header").class("movie-header");
    header.append(new ElementBuilder("h2").text(movie.Title));

    if (isLoggedIn) {
      const actions = new ElementBuilder("div");
      actions.append(new ButtonBuilder("Edit").onclick(() => location.href = "edit.html?imdbID=" + movie.imdbID));
      actions.append(new ButtonBuilder("Delete").onclick(() => deleteMovie(movie.imdbID)));
      header.append(actions);
    }

    body.append(header);

    body.append(
      new ElementBuilder("p")
        .class("movie-meta")
        .append(new ElementBuilder("span").text("Runtime " + formatRuntime(movie.Runtime)))
        .append(new ElementBuilder("span").text("•"))
        .append(new ElementBuilder("span").text("Released on " + new Date(movie.Released).toLocaleDateString("en-US")))
    );

    const genres = new ElementBuilder("p").class("genres");
    for (const genre of movie.Genres) {
      genres.append(new ElementBuilder("span").class("genre").text(genre));
    }
    body.append(genres);

    body.append(new ElementBuilder("p").class("movie-plot").text(movie.Plot));

    body.append(new ElementBuilder("footer").class("movie-credits")
      .append(new ElementBuilder("section").class("credit-group directors")
        .append(new ElementBuilder("h3").text(movie.Directors.length > 1 ? "Directors" : "Director"))
        .append(new ListBuilder().items(movie.Directors))
      )
      .append(new ElementBuilder("section").class("credit-group writers")
        .append(new ElementBuilder("h3").text(movie.Writers.length > 1 ? "Writers" : "Writer"))
        .append(new ListBuilder().items(movie.Writers))
      )
      .append(new ElementBuilder("section").class("credit-group actors")
        .append(new ElementBuilder("h3").text(movie.Actors.length > 1 ? "Actors" : "Actor"))
        .append(new ListBuilder().items(movie.Actors))
      )
    );

    this.append(figure).append(body);
  }
}

export class ButtonBuilder extends ElementBuilder {
  constructor(text) {
    super("button").with("type", "button").text(text)
  }

  onclick(handler) {
    return this.listener("click", handler)
  }
}
