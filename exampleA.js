define(function(require, exports, module) {
    var _ = require('underscore');
    var MsgBus = require('ironclad').MessageBus;
    var AssetModule = require('modules/asset/module');
    var linkNavRegistry = require('modules/link-nav/registry');
    var i18n = require('modules/i18n/main');

    var HeaderView = require('./views/header');
    var CreateView = require('./views/create');

    var currentProject = require('./models/current-project');
    var GroupModel = require('modules/groups/models/group');
    var UserModel = require('modules/users/models/user');

    MsgBus.commands.setHandler('assets:projects:data', function(params, data) {
        currentProject.clear();
        currentProject.set({ id: params.id });
        currentProject.fetch().success(function(response) {
            if (currentProject.get('name')) {
                var options = _.extend({ project: currentProject }, params);
                data.set(options);

                data.trigger('loaded');


                var thisProject = data.get('project');

                //TODO Update this code when HUB-886 is done, with the correct smallLogoUrl !
                var glyph = { icon: (thisProject.get('kb')) ? 'fa fa-cube' : 'fa fa-cubes'};
                if (thisProject.get('logos').smallLogoUrl &&
                    (thisProject.get('logos').smallLogoUrl !== '../compiled/images/generic-external-32px.png') &&
                    (thisProject.get('logos').smallLogoUrl !== '../compiled/images/generic-internal-32px.png')
                ){
                    glyph = { href: thisProject.get('logos').smallLogoUrl };
                }
                MsgBus.commands.execute('recent-item:add', thisProject.get('id'),
                    thisProject.get('name'),'projects/id:' + thisProject.get('id'), glyph);
            }
        }).error(function(response){
            if (response.status !== 0){
                if(response.status === 404) {
                    MsgBus.commands.execute('recent-item:remove', params.id);
                }
                var currentErrorMessage = response.responseJSON.errorMessage;
                if (response.responseJSON.errorCode === '{core.rest.type_mismatch}'){
                    currentErrorMessage = i18n.get('app.modules.errors.reasons.deleted');
                }
                var options = _.extend(params, {
                    view: 'error'
                    , error: response
                    , errorMessage: currentErrorMessage
                });
                data.set(options);
                // HUB-6590 - Not triggering loaded since this is an error condition
                // data.trigger('loaded');
            }
        });
    });

    MsgBus.reqres.setHandler('projects:views:header', function() {
        return HeaderView;
    });

    MsgBus.reqres.setHandler('projects:views:modals:create', function() {
        return CreateView;
    });

    MsgBus.commands.setHandler('assets:projects:data:modal', function(params, data) {
        if (params.usergroupId){
            var groupModel = new GroupModel({
                id: params.usergroupId
            });

            groupModel.fetch().success(function() {
                var options = _.extend({ name: groupModel.get('name') }, params);
                data.set(options);
                params.name = options.name;
                data.trigger('loaded');
            });
        }
        else if (params.userId) {
            var userModel = new UserModel({
                id: params.userId
            });

            userModel.fetch().success(function() {
                var options = _.extend({ name: userModel.get('name') }, params);
                data.set(options);
                params.name = options.name;
                data.trigger('loaded');
            });
        } else {
            data.trigger('loaded');
        }
    });

    linkNavRegistry.addMenuItem('create-menu', '#projects-create-link', {}, 10);

    module.exports = new AssetModule({
        name: 'projects'
        , defaultParams: {
            view: 'versions'
        }
    });
});
