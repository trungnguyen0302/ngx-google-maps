import { DetailMapsComponent } from './detail-maps/detail-maps.component';
import { NormalMapsComponent } from './normal-maps/normal-maps.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AgmCoreModule } from '@agm/core';

import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AgmDirectionModule } from 'agm-direction';


@NgModule({
  declarations: [
    AppComponent,
    NormalMapsComponent,
    DetailMapsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyDuxR3jyTgjHRqresdUYtGD4Sx9_wtmaeA',
      libraries: ['places']
    }),
    AgmDirectionModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
