module Jekyll
  class TagPageGenerator < Generator
    safe true

    def generate(site)
      # Create directory for tags if it doesn't exist
      tag_dir = site.config['tag_dir'] || 'tags'
      
      # Iterate through all tags on the site
      site.tags.each do |tag, posts|
        # Convert tag to lowercase and replace spaces with hyphens for the URL slug
        tag_slug = Utils.slugify(tag)
        
        # Create a new page for this specific tag
        site.pages << TagPage.new(site, site.source, File.join(tag_dir, tag_slug), tag)
      end
    end
  end

  # Subclass of Page that defines a tag page
  class TagPage < Page
    def initialize(site, base, dir, tag)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'tag.html')
      
      self.data['tag'] = tag
      self.data['title'] = "Tag: #{tag}"
    end
  end
end 