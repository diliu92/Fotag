'use strict';

/**
 * A function that creates and returns all of the model classes and constants.
  */
function createViewModule() {

    var LIST_VIEW = 'LIST_VIEW';
    var GRID_VIEW = 'GRID_VIEW';
    var RATING_CHANGE = 'RATING_CHANGE';
    var IMAGE_ADDED_TO_COLLECTION_EVENT = 'IMAGE_ADDED_TO_COLLECTION_EVENT';
    var IMAGE_REMOVED_FROM_COLLECTION_EVENT = 'IMAGE_REMOVED_FROM_COLLECTION_EVENT';
    var IMAGE_META_DATA_CHANGED_EVENT = 'IMAGE_META_DATA_CHANGED_EVENT';

    /**
     * An object representing a DOM element that will render the given ImageModel object.
     */
    var ImageRenderer = function(imageModel) {
        this.imageElement = document.createElement('div');
        this.imageElement.className = "images";
        this.viewType = "GRID_VIEW";
        this.imageContainer = document.getElementById('image-container');
        this.imageContainer.appendChild(this.imageElement);
        this.imageTemplate = document.getElementById('image-info');
        this.setImageModel(imageModel);
    };

    _.extend(ImageRenderer.prototype, {

        /**
         * Returns an element representing the ImageModel, which can be attached to the DOM
         * to display the ImageModel.
         */
        getElement: function() {
            return this.imageElement;
        },

        /**
         * Returns the ImageModel represented by this ImageRenderer.
         */
        getImageModel: function() {
            return this.imageModel;
        },

        /**
         * Sets the ImageModel represented by this ImageRenderer, changing the element and its
         * contents as necessary.
         */
        setImageModel: function(imageModel) {
            this.imageModel = imageModel;
            this.imageElement.innerHTML = "";
            this.imageElement.appendChild(document.importNode(this.imageTemplate.content, true));
            var thumbnail = this.imageElement.getElementsByClassName("thumbnails")[0];
            var caption = this.imageElement.getElementsByClassName("captions")[0];
            var date = this.imageElement.getElementsByClassName("dates")[0];
            var ratingEl = this.imageElement.getElementsByClassName("ratings")[0];
            thumbnail.src = "." + imageModel.getPath();
            caption.innerHTML = imageModel.getCaption();
            date.innerHTML = this.getDateString(imageModel.getModificationDate());
            this.updateRating(ratingEl, imageModel.getRating());

            var that = this;
            ratingEl.addEventListener("click",function(eventData){
                var src = eventData.srcElement;
                if (src.className.indexOf("ratings") > -1){
                    var rating = Math.floor(eventData.layerX / 20 + 1);
                    if (rating > 5){
                        rating = 5;
                    }
                    that.imageModel.setRating(rating);
                }
                else if (src.className.indexOf("star1") > -1){
                    that.imageModel.setRating(1);
                }
                else if (src.className.indexOf("star2") > -1){
                    that.imageModel.setRating(2);
                }
                else if (src.className.indexOf("star3") > -1){
                    that.imageModel.setRating(3);
                }
                else if (src.className.indexOf("star4") > -1){
                    that.imageModel.setRating(4);
                }
                else if (src.className.indexOf("star5") > -1){
                    that.imageModel.setRating(5);
                }
                that.updateRating(ratingEl,that.imageModel.getRating());
                that.imageElement.className = "images filter" + that.imageModel.getRating();
            });
            thumbnail.addEventListener("click", function(eventData){
                var src = eventData.srcElement.src;
                var enlargedImageContainer = document.getElementById("enlarged-image-container");
                enlargedImageContainer.className = "";
                var enlargedImage = document.getElementById("enlarged-image");
                enlargedImage.src = src;
            });
        },

        /**
         * Changes the rendering of the ImageModel to either list or grid view.
         * @param viewType A string, either LIST_VIEW or GRID_VIEW
         */
        setToView: function(viewType) {
            this.viewType = viewType;
            if (viewType == GRID_VIEW){
                this.imageElement.className = "gird-view";
            }
            else{
                this.imageElement.className = "list-view";
            }
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type it is
         * currently rendering.
         */
        getCurrentView: function() {
            return this.viewType;
        },

        updateRating: function(element, rating){
            var stars = element.getElementsByClassName("stars");
            var i;
            for (i = 4; i >= 0; i--){
                stars[i].className = stars[i].className.replace(/ invisible/g,"");
                if (i >= 5-rating){
                    stars[i].className += " invisible";
                }
            }
            this.imageElement.className = "images filter" + rating;

        },

        getDateString: function(date){
            var dd = date.getDate();
            var mm = date.getMonth() + 1;
            var yyyy = date.getFullYear();
            return mm + "/" + dd + "/" + yyyy;
        }
    });

    /**
     * A factory is an object that creates other objects. In this case, this object will create
     * objects that fulfill the ImageRenderer class's contract defined above.
     */
    var ImageRendererFactory = function() {
    };

    _.extend(ImageRendererFactory.prototype, {

        /**
         * Creates a new ImageRenderer object for the given ImageModel
         */
        createImageRenderer: function(imageModel) {
            return new ImageRenderer(imageModel);
        }
    });

    /**
     * An object representing a DOM element that will render an ImageCollectionModel.
     * Multiple such objects can be created and added to the DOM (i.e., you shouldn't
     * assume there is only one ImageCollectionView that will ever be created).
     */
    var ImageCollectionView = function() {
        this.viewType = GRID_VIEW;
        this.imageRendererFactory = null;
        this.renderers = [];
        this.imageCollectionModel = null;
        this.imageCollectionViewElement = this.getElement();
        document.getElementById('image-container').appendChild(this.imageCollectionViewElement);
    };

    _.extend(ImageCollectionView.prototype, {
        /**
         * Returns an element that can be attached to the DOM to display the ImageCollectionModel
         * this object represents.
         */
        getElement: function() {
            var imageCollectionViewElement = document.createElement('div');
            imageCollectionViewElement.className = "image-collection-container";
            return imageCollectionViewElement;
        },

        /**
         * Gets the current ImageRendererFactory being used to create new ImageRenderer objects.
         */
        getImageRendererFactory: function() {
            return this.imageRendererFactory;
        },

        /**
         * Sets the ImageRendererFactory to use to render ImageModels. When a *new* factory is provided,
         * the ImageCollectionView should redo its entire presentation, replacing all of the old
         * ImageRenderer objects with new ImageRenderer objects produced by the factory.
         */
        setImageRendererFactory: function(imageRendererFactory) {
            if (this.imageRendererFactory != imageRendererFactory){
                this.imageRendererFactory = imageRendererFactory;
                this.renderers.splice(0,this.renderers.length);
                var i;
                var models = this.imageCollectionModel.getImageModels();
                for (i = 0; i < models.length; i++){
                    var renderer = this.imageRendererFactory.createImageRenderer(models[i]);
                    this.renderers.push(renderer);
                }
            }
        },

        /**
         * Returns the ImageCollectionModel represented by this view.
         */
        getImageCollectionModel: function() {
            return this.imageCollectionModel;
        },

        /**
         * Sets the ImageCollectionModel to be represented by this view. When setting the ImageCollectionModel,
         * you should properly register/unregister listeners with the model, so you will be notified of
         * any changes to the given model.
         */
        setImageCollectionModel: function(imageCollectionModel) {
            this.imageCollectionModel = imageCollectionModel;
            var that = this;
            this.imageCollectionModel.addListener(function(eventType, imageModelCollection, imageModel, eventDate){
                switch(eventType){
                    case IMAGE_ADDED_TO_COLLECTION_EVENT:
                        var newRenderer = that.imageRendererFactory.createImageRenderer(imageModel);
                        break;
                    case IMAGE_REMOVED_FROM_COLLECTION_EVENT:
                        var i;
                        for(i = 0; i < that.renderers.length; i++){
                            if (that.renderers[i].getImageModel() == imageModel){
                                var parent = document.getElementById('image-container');
                                var child = that.renderers.getElement();
                                parent.removeChild(child);
                                that.renderers.splice(i,1);
                                break;
                            }
                        }
                        break;
                    case IMAGE_META_DATA_CHANGED_EVENT:
                        var i;
                        for (i = 0; i < that.renderers.length; i++){
                            if (that.renderers[i].getImageModel() == imageModel){
                                that.renderers[i].setImageModel(imageModel);
                                break;
                            }
                        }
                        break;
                }
            });
        },

        /**
         * Changes the presentation of the images to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW.
         */
        setToView: function(viewType) {
            this.viewType = viewType;
            var i;
            for (i = 0; i < this.renderers.length; i++){
                this.renderers[i].setToView(viewType);
            }
        },

        /**
         * Returns a string of either LIST_VIEW or GRID_VIEW indicating which view type is currently
         * being rendered.
         */
        getCurrentView: function() {
            return this.viewType;
        }
    });

    /**
     * An object representing a DOM element that will render the toolbar to the screen.
     */
    var Toolbar = function() {
        this.listeners =[];
        this.notify = function(toolbar, eventType) {
            _.each(this.listeners, function(listener) {
               listener(toolbar, eventType, new Date());
            });
        };
        this.currentView = null;
        this.currentRatingFilter = null;
        this.toolbarElement = this.getElement();
        document.getElementById('toolbar-container').appendChild(this.toolbarElement);
        this.toolbarTemplate = document.getElementById("toolbar");
        this.toolbarElement.appendChild(document.importNode(this.toolbarTemplate.content, true));
        this.setToView(GRID_VIEW);
        this.setRatingFilter(0);

        this.gridViewBtn = this.toolbarElement.getElementsByClassName("grid-view-btn")[0];
        this.listViewBtn = this.toolbarElement.getElementsByClassName("list-view-btn")[0];
        this.FilterByRating = this.toolbarElement.getElementsByClassName("ratings")[0];
        var that = this;
        this.gridViewBtn.addEventListener("click", function(){
            that.setToView(GRID_VIEW);
        });
        this.listViewBtn.addEventListener("click",function(){
            that.setToView(LIST_VIEW);
        });
        this.FilterByRating.addEventListener("click",function(eventData){
            var src = eventData.srcElement;
            var rating = 0;
            if (src.className.indexOf("ratings") > -1){
                rating = Math.floor(eventData.layerX / 29 + 1);
                if (rating > 5){
                    rating = 5;
                }
            }
            else if (src.className.indexOf("star1") > -1){
                rating = 1;
            }
            else if (src.className.indexOf("star2") > -1){
                rating = 2;
            }
            else if (src.className.indexOf("star3") > -1){
                rating = 3;
            }
            else if (src.className.indexOf("star4") > -1){
                rating = 4;
            }
            else if (src.className.indexOf("star5") > -1){
                rating = 5;
            }
            that.setRatingFilter(rating);
        });
    };

    _.extend(Toolbar.prototype, {
        /**
         * Returns an element representing the toolbar, which can be attached to the DOM.
         */
        getElement: function() {
            var toolbarElement = document.createElement('div');
            toolbarElement.className = "toolbar";
            return toolbarElement;
        },

        /**
         * Registers the given listener to be notified when the toolbar changes from one
         * view type to another.
         * @param listener_fn A function with signature (toolbar, eventType, eventDate), where
         *                    toolbar is a reference to this object, eventType is a string of
         *                    either, LIST_VIEW, GRID_VIEW, or RATING_CHANGE representing how
         *                    the toolbar has changed (specifically, the user has switched to
         *                    a list view, grid view, or changed the star rating filter).
         *                    eventDate is a Date object representing when the event occurred.
         */
        addListener: function(listener_fn) {
            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from the toolbar.
         */
        removeListener: function(listener_fn) {
            var index = this.listeners.indexOf(listener_fn);
            if (index !== -1) {
                this.listeners.splice(index, 1);
            }
        },

        /**
         * Sets the toolbar to either grid view or list view.
         * @param viewType A string of either LIST_VIEW or GRID_VIEW representing the desired view.
         */
        setToView: function(viewType) {
            if (viewType != this.currentView){
                this.currentView = viewType;
                if (viewType == GRID_VIEW){
                    this.toolbarElement.className = "toolbar grid-view";
                    this.notify(this, GRID_VIEW);
                }
                else{
                    this.toolbarElement.className = "toolbar list-view";
                    this.notify(this, LIST_VIEW);
                }
            }
        },

        /**
         * Returns the current view selected in the toolbar, a string that is
         * either LIST_VIEW or GRID_VIEW.
         */
        getCurrentView: function() {
            return this.currentView;
        },

        /**
         * Returns the current rating filter. A number in the range [0,5], where 0 indicates no
         * filtering should take place.
         */
        getCurrentRatingFilter: function() {
            return this.currentRatingFilter;
        },

        /**
         * Sets the rating filter.
         * @param rating An integer in the range [0,5], where 0 indicates no filtering should take place.
         */
        setRatingFilter: function(rating) {
            if (rating != this.currentRatingFilter){
                this.currentRatingFilter = rating;
            }
            else{
                this.currentRatingFilter = 0;
            }
            var el = this.toolbarElement.getElementsByClassName("ratings")[0];
            this.updateRating(el,this.currentRatingFilter);
            this.notify(this, RATING_CHANGE);
        },

        updateRating: function(element, rating){
            var stars = element.getElementsByClassName("stars");
            var i;
            for (i = 4; i >= 0; i--){
                stars[i].className = stars[i].className.replace(/ invisible/g,"");
                if (i >= 5-rating){
                    stars[i].className += " invisible";
                }
            }
        },
    });

    /**
     * An object that will allow the user to choose images to display.
     * @constructor
     */
    var FileChooser = function() {
        this.listeners = [];
        this._init();
    };

    _.extend(FileChooser.prototype, {
        // This code partially derived from: http://www.html5rocks.com/en/tutorials/file/dndfiles/
        _init: function() {
            var self = this;
            this.fileChooserDiv = document.createElement('div');
            var fileChooserTemplate = document.getElementById('file-chooser');
            this.fileChooserDiv.appendChild(document.importNode(fileChooserTemplate.content, true));
            var fileChooserInput = this.fileChooserDiv.querySelector('.files-input');
            fileChooserInput.addEventListener('change', function(evt) {
                var files = evt.target.files;
                var eventDate = new Date();
                _.each(
                    self.listeners,
                    function(listener_fn) {
                        listener_fn(self, files, eventDate);
                    }
                );
            });
        },

        /**
         * Returns an element that can be added to the DOM to display the file chooser.
         */
        getElement: function() {
            return this.fileChooserDiv;
        },

        /**
         * Adds a listener to be notified when a new set of files have been chosen.
         * @param listener_fn A function with signature (fileChooser, fileList, eventDate), where
         *                    fileChooser is a reference to this object, fileList is a list of files
         *                    as returned by the File API, and eventDate is when the files were chosen.
         */
        addListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.addListener: " + JSON.stringify(arguments));
            }

            this.listeners.push(listener_fn);
        },

        /**
         * Removes the given listener from this object.
         * @param listener_fn
         */
        removeListener: function(listener_fn) {
            if (!_.isFunction(listener_fn)) {
                throw new Error("Invalid arguments to FileChooser.removeListener: " + JSON.stringify(arguments));
            }
            this.listeners = _.without(this.listeners, listener_fn);
        }
    });

    // Return an object containing all of our classes and constants
    return {
        ImageRenderer: ImageRenderer,
        ImageRendererFactory: ImageRendererFactory,
        ImageCollectionView: ImageCollectionView,
        Toolbar: Toolbar,
        FileChooser: FileChooser,

        LIST_VIEW: LIST_VIEW,
        GRID_VIEW: GRID_VIEW,
        RATING_CHANGE: RATING_CHANGE
    };
}
