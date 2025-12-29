from django.db import models

class News(models.Model):
    title = models.CharField(max_length=200)
    short_description = models.TextField()
    full_description = models.TextField()
    date = models.DateField()
    image = models.URLField()

    def __str__(self):
        return self.title
