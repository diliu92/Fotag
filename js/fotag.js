'use strict';

// This should be your main point of entry for your app

window.addEventListener('load', function() {
    var modelModule = createModelModule();
    var viewModule = createViewModule();
    var appContainer = document.getElementById('app-container');
    var fileChooserConatiner = document.getElementById('file-chooser-container');

    //create tool bar
    var toolbar = new viewModule.Toolbar();
    toolbar.addListener(function(toolbar, eventType, eventDate){
        switch(eventType){
            case viewModule.LIST_VIEW:
                appContainer.className = appContainer.className.replace(/grid-view/g,"");
                appContainer.className = appContainer.className.replace(/list-view/g,"");
                appContainer.className += " list-view";
                break;
            case viewModule.GRID_VIEW:
                appContainer.className = appContainer.className.replace(/list-view/g,"");
                appContainer.className = appContainer.className.replace(/grid-view/g,"");
                appContainer.className += " grid-view";
                break;
            case viewModule.RATING_CHANGE:
                if (toolbar.getCurrentView() == viewModule.GRID_VIEW){
                    appContainer.className = "grid-view";
                }
                else{
                    appContainer.className = "list-view";
                }
                appContainer.className += " filter" + toolbar.getCurrentRatingFilter();
                break;
        }
    });

    // Attach the file chooser to the page. You can choose to put this elsewhere, and style as desired
    var fileChooser = new viewModule.FileChooser();
    fileChooserConatiner.appendChild(fileChooser.getElement());

    // display save images
    var imageCollectionModel = modelModule.loadImageCollectionModel();
    var imageCollectionView = new viewModule.ImageCollectionView();
    var imageRendererFactory = new viewModule.ImageRendererFactory();
    imageCollectionView.setImageCollectionModel(imageCollectionModel);
    imageCollectionView.setImageRendererFactory(imageRendererFactory);

    // choose files and save to local storage
    fileChooser.addListener(function(fileChooser, files, eventDate) {
        _.each(
            files,
            function(file) {
                imageCollectionModel.addImageModel(
                    new modelModule.ImageModel(
                        '/images/' + file.name,
                        file.lastModifiedDate,
                        file.name,
                        0
                    ));
            }
        );
        modelModule.storeImageCollectionModel(imageCollectionModel);
    });

    var enlargedImageContainer = document.getElementById("enlarged-image-container");
    enlargedImageContainer.addEventListener("click", function(){
        enlargedImageContainer.className = "hidden";
    });
});
