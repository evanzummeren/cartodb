var cdb = require('cartodb.js');
var DatasetsItem = require('./datasets/datasets_item');
var MapsItem = require('./maps/maps_item');
var RemoteDatasetsItem = require('./datasets/remote_datasets_item');

/**
 *  View representing the list of items
 */

module.exports = cdb.core.View.extend({

  tagName: 'ul',

  events: {},

  _ITEMS: {
    'remotes':  RemoteDatasetsItem,
    'datasets': DatasetsItem,
    'maps':     MapsItem
  },

  initialize: function() {
    this.router = this.options.router;
    this.user = this.options.user;
    this._initBinds();
  },

  render: function() {
    this.clearSubViews();
    var content_type = this.router.model.get('content_type');
    var size = this.collection.size();
    var totalSize = this.collection[ content_type === "datasets" ? '_TABLES_PER_PAGE' : '_ITEMS_PER_PAGE'];
    this.$el.attr('class', content_type === 'datasets' ? 'DatasetsList' : 'MapsList');
    this.collection.each(this._addItem, this);

    return this;
  },

  _addItem: function(m, i) {
    var type = this.router.model.get('content_type');

    if (m.get('type') === "remote" && type === "datasets") {
      type = "remotes"
    }

    var item = new this._ITEMS[type]({
      model:  m,
      router: this.router,
      user:   this.user
    });
    item.bind('remoteSelected', function(d){
      this.trigger('remoteSelected', d, this);
    }, this)

    this.addView(item);
    this.$el.append(item.render().el);
  },

  _initBinds: function() {
    this.collection.bind('loading', this._onItemsLoading, this);
    this.collection.bind('reset remove', this.render, this);
    this.add_related_model(this.collection);
  },

  _onItemsLoading: function() {
    this.$el.addClass('is-loading');
  },

  show: function() {
    this.$el.removeClass('is-hidden');
  },

  hide: function() {
    this.$el.addClass('is-hidden');
  }

});
