from django import forms

from tracker.models import Series, FavoriteSites


class SeriesForm(forms.ModelForm):
    
    class Meta:
        model = Series
        fields = ('title', 
                  'description', 
                  'release_day', 
                  'current_episode', 
                  'stream_site', 
                  'cover_image_url', 
                  'tag',
                  'season',
                  'time',)
    
    def __init__(self, *args, **kwargs):
        super(SeriesForm, self).__init__(*args, **kwargs)
        
        for field in self.fields.values():
            field.error_messages = {'required':'{fieldname} is required.'.format(
                fieldname=field.label.upper())}


class FavoriteSitesForm(forms.ModelForm):
    class Meta:
        model = FavoriteSites
        fields = ('site_url',)