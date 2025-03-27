module Jekyll
  class CategoryPageGenerator < Generator
    safe true

    def generate(site)
      # Create directory for categories if it doesn't exist
      category_dir = site.config['category_dir'] || 'categories'
      
      # Iterate through all categories on the site
      site.categories.each do |category, posts|
        # Convert category to lowercase and replace spaces with hyphens for the URL slug
        category_slug = Utils.slugify(category)
        
        # Create a new page for this specific category
        site.pages << CategoryPage.new(site, site.source, File.join(category_dir, category_slug), category)
      end
    end
  end

  # Subclass of Page that defines a category page
  class CategoryPage < Page
    def initialize(site, base, dir, category)
      @site = site
      @base = base
      @dir = dir
      @name = 'index.html'

      self.process(@name)
      self.read_yaml(File.join(base, '_layouts'), 'category.html')
      
      self.data['category'] = category
      self.data['title'] = "Category: #{category}"
    end
  end
end 