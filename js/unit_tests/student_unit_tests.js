'use strict';

var expect = chai.expect;

describe('Student Unit Tests', function() {
    // describe('ActivityCollectionModel', function(){
 //        var model = new ActivityCollectionModel();
 //        var activityType = "Writing Code";
 //        var healthMetricsDict = {};
 //        healthMetricsDict["energyLevel"] = 3;
 //        healthMetricsDict["stressLevel"] = 2;
 //        healthMetricsDict["happinessLevel"] = 4;
 //        var activityDurationInMinutes = 15;
 //        var dataPoint = new ActivityData(activityType, healthMetricsDict, activityDurationInMinutes);

 //        it('should add ActivityData correctly.', function(){
 //            model.addActivityDataPoint(dataPoint);
 //            expect(model.getActivityDataPoints().length).to.be.equal(1);
 //            expect(model.getActivityDataPoints()[0]).to.be.equal(dataPoint);
 //        });
 //        it('should remove ActivityData correctly.', function(){
 //            model.removeActivityDataPoint(dataPoint);
 //            expect(model.getActivityDataPoints().length).to.be.equal(0);
 //        });
 //        it('should not accept invalid data.', function(){
 //            dataPoint.activityDurationInMinutes = -1;
 //            model.addActivityDataPoint(dataPoint);
 //            dataPoint.activityDurationInMinutes = "a";
 //            model.addActivityDataPoint(dataPoint);
 //            dataPoint.activityDurationInMinutes = null;
 //            model.addActivityDataPoint(dataPoint);
 //            dataPoint.activityDurationInMinutes = 1.1;
 //            model.addActivityDataPoint(dataPoint);
 //            expect(model.getActivityDataPoints().length).to.be.equal(0);
 //        });
 //    });
    var modelModule = createModelModule();

    describe('ImageModel', function(){
        var imageModel = new modelModule.ImageModel(
                            '/images/GOPR0042-small.jpg',
                            new Date(),
                            'GOPR0042-small.jpg',
                            0
                        );
        it('should change rating and update modification date correctly.', function(){
            var oldDate = imageModel.getModificationDate();
            imageModel.setRating(3);
            expect(imageModel.getRating()).to.be.equal(3);
            expect(imageModel.getModificationDate() == oldDate).to.be.false;
        });
        it('should clear rating when new rating is the same as the old rating.',function(){
            var oldDate = imageModel.getModificationDate();
            imageModel.setRating(3);
            expect(imageModel.getRating()).to.be.equal(0);
            expect(imageModel.getModificationDate() == oldDate).to.be.false;
        });
        it('should add listeners correctly and notify listeners when model is changed.', function(){
            var listener_fn = sinon.spy();
            var addListenerSpy = sinon.spy(imageModel, "addListener");
            var removeListenerSpy = sinon.spy(imageModel, "removeListener");
            imageModel.addListener(listener_fn);
            imageModel.setRating(2);
            expect(addListenerSpy.calledWith(listener_fn)).to.be.true;
            expect(addListenerSpy.calledOnce).to.be.true;
            expect(imageModel.listeners.length).to.be.equal(1);
        });
    });
    describe('ImageCollectionModel', function(){
        var imageCollectionModel = new modelModule.ImageCollectionModel();
        var imageModel1 = new modelModule.ImageModel(
                            '/images/GOPR0042-small.jpg',
                            new Date(),
                            'GOPR0042-small.jpg',
                            0
                        );
        var imageModel2 = new modelModule.ImageModel(
                            '/images/GOPR0074-small.jpg',
                            new Date(),
                            'GOPR0074-small.jpg',
                            0
                        );
        var listener_fn = sinon.spy();
        var addListenerSpy = sinon.spy(imageCollectionModel, "addListener");
        var removeListenerSpy = sinon.spy(imageCollectionModel, "removeListener");
        it('should add listeners correctly', function(){
            imageCollectionModel.addListener(listener_fn);
            expect(addListenerSpy.calledWith(listener_fn)).to.be.true;
            expect(addListenerSpy.calledOnce).to.be.true;
            expect(imageCollectionModel.listeners.length).to.be.equal(1);
        });
        it('should add imageModel correctly and notify listeners', function(){
            imageCollectionModel.addImageModel(imageModel1);
            expect(imageCollectionModel.getImageModels().length == 1).to.be.true;
            expect(listener_fn.calledOnce).to.be.true;
        });
        it('should notify listeners when a imageModel in the collection changed.', function(){
            imageModel1.setRating(1);
            expect(listener_fn.callCount).to.be.equal(2); //1 time for previous test, 1 time for current test
        });
        it('should remove a given imageModel correctly and notify listeners.', function(){
            imageCollectionModel.removeImageModel(imageModel2);
            expect(imageCollectionModel.getImageModels().length == 1).to.be.true;
            imageCollectionModel.removeImageModel(imageModel1);
            expect(imageCollectionModel.getImageModels().length == 0).to.be.true;
            expect(listener_fn.callCount).to.be.equal(3); //2 times for previous tests, 1 time for current test
        });
    });
});
