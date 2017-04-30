define("modules/projects/views/create", ["require", "exports", "module", "underscore", "modules/i18n/main", "modules/form/views/modal", "modules/form/behaviors/collapse-fields", "ironclad", "modules/router/router-history", "../models/create"], function(a, b, c) {
    var d = a("underscore")
        , e = a("modules/i18n/main")
        , f = a("modules/form/views/modal")
        , g = a("modules/form/behaviors/collapse-fields")
        , h = a("ironclad")
        , i = h.MessageBus
        , j = a("modules/router/router-history")
        , k = a("../models/create");
    c.exports = f.extend({
        formFields: {
            name: {
                type: "text",
                label: e.get("app.projects.name"),
                autofocus: !0
            },
            description: {
                type: "textarea",
                label: e.get("app.projects.description")
            },
            projectOwnerId: {
                type: "select-user",
                label: e.get("app.projects.owner"),
                placeholder: e.get("app.modules.common.header.owner.placeholder")
            },
            tier: {
                type: "select",
                label: e.get("app.projects.tier"),
                binding: {
                    escape: !1,
                    selectOptions: {
                        collection: function() {
                            return [{
                                label: e.get("app.projects.tier.1"),
                                value: 1
                            }, {
                                label: e.get("app.projects.tier.2"),
                                value: 2
                            }, {
                                label: e.get("app.projects.tier.3"),
                                value: 3
                            }, {
                                label: e.get("app.projects.tier.4"),
                                value: 4
                            }, {
                                label: e.get("app.projects.tier.5"),
                                value: 5
                            }]
                        }
                    }
                }
            },
            version: {
                type: "text",
                label: e.get("app.modules.versions.name")
            },
            releaseComments: {
                type: "text",
                label: e.get("app.modules.versions.notes")
            },
            nickname: {
                type: "text",
                label: e.get("app.modules.versions.nickname")
            },
            releasedOn: {
                type: "date",
                label: e.get("app.modules.versions.releaseDate")
            },
            phase: {
                type: "select",
                label: e.get("app.modules.work.phaseLabel"),
                binding: {
                    selectOptions: {
                        collection: function() {
                            return [{
                                label: e.get("app.modules.common.phase.PLANNING"),
                                value: "PLANNING"
                            }, {
                                label: e.get("app.modules.common.phase.DEVELOPMENT"),
                                value: "DEVELOPMENT"
                            }, {
                                label: e.get("app.modules.common.phase.RELEASED"),
                                value: "RELEASED"
                            }, {
                                label: e.get("app.modules.common.phase.DEPRECATED"),
                                value: "DEPRECATED"
                            }, {
                                label: e.get("app.modules.common.phase.ARCHIVED"),
                                value: "ARCHIVED"
                            }]
                        }
                    }
                }
            },
            distribution: {
                type: "select",
                label: e.get("app.modules.versions.distribution"),
                binding: {
                    selectOptions: {
                        collection: function() {
                            return [{
                                label: e.get("app.modules.common.distribution.EXTERNAL"),
                                value: "EXTERNAL"
                            }, {
                                label: e.get("app.modules.common.distribution.SAAS"),
                                value: "SAAS"
                            }, {
                                label: e.get("app.modules.common.distribution.INTERNAL"),
                                value: "INTERNAL"
                            }, {
                                label: e.get("app.modules.common.distribution.OPENSOURCE"),
                                value: "OPENSOURCE"
                            }]
                        }
                    }
                }
            },
            projectLevelAdjustments: {
                type: "checkbox",
                label: e.get("app.projects.projectLevelAdjustments"),
                description: e.get("app.projects.projectLevelAdjustments.yes.description"),
                binding: {
                    selectOptions: {
                        collection: function() {
                            return [{
                                label: e.get("app.projects.projectLevelAdjustments.yes"),
                                value: ""
                            }]
                        }
                    }
                }
            }
        },
        behaviors: d.extend({
            CollapseProjectFieldsBehavior: {
                behaviorClass: g,
                fieldsSelector: ".field-description, .field-projectOwnerId, .field-tier",
                expandTitle: e.get("app.modules.projects.create.projectDetails"),
                collapseTitle: e.get("app.modules.projects.create.projectDetailsCollapse")
            },
            CollapseVersionFieldsBehavior: {
                behaviorClass: g,
                fieldsSelector: ".field-releaseComments, .field-nickname, .field-releasedOn, .field-phase, .field-distribution",
                expandTitle: e.get("app.modules.projects.create.versionDetails"),
                collapseTitle: e.get("app.modules.projects.create.versionDetailsCollapse")
            }
        }, f.prototype.behaviors),
        id: "projects-create-modal",
        headerView: e.get("app.projects.createModalTitle"),
        footerTemplate: "#form-buttons-create",
        initialize: function() {
            f.prototype.initialize.apply(this, arguments),
                this.model = new k,
                this.options.redirectOnCancel = !0,
                this.delegateEvents()
        },
        onRender: function() {
            f.prototype.onRender.apply(this, arguments),
                this.model.set("name", this.options.name || ""),
                this.$('input[name="name"]').val(this.options.name)
        },
        renderError: function() {},
        onCancel: function() {
            j.moveToPreviousHash(!1, !0)
        },
        redirect: function() {
            return this.options.type ? (i.vent.trigger("new:project:created:" + this.options.type, this.model),
                    null) : "#projects/id:" + this.model.id
        }
    })
}),