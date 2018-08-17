import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { FormControl, FormGroupDirective, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import 'rxjs/add/operator/map';


@Component({
  selector: 'app-book-create',
  templateUrl: './book-create.component.html',
  styleUrls: ['./book-create.component.css']
})
export class BookCreateComponent implements OnInit {
  filesToUpload: Array<File> = [];

  bookForm: FormGroup;
  title: string = '';
  description: string = '';
  author: string = '';
  publisher: string = '';
  published_year: string = '';
 

  constructor(private router: Router, private api: ApiService, private formBuilder: FormBuilder, private http: HttpClient) { }

  ngOnInit() {
    this.bookForm = this.formBuilder.group({
      'title': [null, Validators.required],
      'description': [null, Validators.required],
      'author': [null, Validators.required],
      'publisher': [null, Validators.required],
      'published_year': [null, Validators.required]
      
    });
  }
  upload() {
    const formData: any = new FormData();
    const files: Array<File> = this.filesToUpload;

    formData.append("myFile", files[0], files[0]['name']);
    this.http.post('http://localhost:3000/upload', formData)
      .subscribe();
      
  }

  fileChangeEvent(fileInput: any) {
    this.filesToUpload = <Array<File>>fileInput.target.files;
  }

  onFormSubmit(form: NgForm) {
    const files: Array<File> = this.filesToUpload;
    form["image_url"] = files[0]['name'];
    this.api.postBook(form)
      .subscribe(res => {
        let id = res['_id'];
        this.router.navigate(['/book-details', id]);
      }, (err) => {
        console.log(err);
      });
     
  }

}