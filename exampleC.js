define("modules/projects/main", ["require", "exports", "module", "underscore", "ironclad", "modules/asset/module", "modules/link-nav/registry", "modules/i18n/main", "./views/header", "./views/create", "./models/current-project", "modules/groups/models/group", "modules/users/models/user"], function(a, b, c) {
    var d = a("underscore")
        , e = a("ironclad").MessageBus
        , f = a("modules/asset/module")
        , g = a("modules/link-nav/registry")
        , h = a("modules/i18n/main")
        , i = a("./views/header")
        , j = a("./views/create")
        , k = a("./models/current-project")
        , l = a("modules/groups/models/group")
        , m = a("modules/users/models/user");
    e.commands.setHandler("assets:projects:data", function(a, b) {
        k.clear(),
            k.set({
                id: a.id
            }),
            k.fetch().success(function(c) {
                if (k.get("name")) {
                    var f = d.extend({
                        project: k
                    }, a);
                    b.set(f),
                        b.trigger("loaded");
                    var g = b.get("project")
                        , h = {
                        icon: g.get("kb") ? "fa fa-cube" : "fa fa-cubes"
                    };
                    g.get("logos").smallLogoUrl && "../compiled/images/generic-external-32px.png" !== g.get("logos").smallLogoUrl && "../compiled/images/generic-internal-32px.png" !== g.get("logos").smallLogoUrl && (h = {
                        href: g.get("logos").smallLogoUrl
                    }),
                        e.commands.execute("recent-item:add", g.get("id"), g.get("name"), "projects/id:" + g.get("id"), h)
                }
            }).error(function(c) {
                if (0 !== c.status) {
                    404 === c.status && e.commands.execute("recent-item:remove", a.id);
                    var f = c.responseJSON.errorMessage;
                    "{core.rest.type_mismatch}" === c.responseJSON.errorCode && (f = h.get("app.modules.errors.reasons.deleted"));
                    var g = d.extend(a, {
                        view: "error",
                        error: c,
                        errorMessage: f
                    });
                    b.set(g)
                }
            })
    }),
        e.reqres.setHandler("projects:views:header", function() {
            return i
        }),
        e.reqres.setHandler("projects:views:modals:create", function() {
            return j
        }),
        e.commands.setHandler("assets:projects:data:modal", function(a, b) {
            if (a.usergroupId) {
                var c = new l({
                    id: a.usergroupId
                });
                c.fetch().success(function() {
                    var e = d.extend({
                        name: c.get("name")
                    }, a);
                    b.set(e),
                        a.name = e.name,
                        b.trigger("loaded")
                })
            } else if (a.userId) {
                var e = new m({
                    id: a.userId
                });
                e.fetch().success(function() {
                    var c = d.extend({
                        name: e.get("name")
                    }, a);
                    b.set(c),
                        a.name = c.name,
                        b.trigger("loaded")
                })
            } else
                b.trigger("loaded")
        }),
        g.addMenuItem("create-menu", "#projects-create-link", {}, 10),
        c.exports = new f({
            name: "projects",
            defaultParams: {
                view: "versions"
            }
        })
})
