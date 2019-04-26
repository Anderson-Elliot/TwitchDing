import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TwitchBot } from '../twitch/TwitchBot';
import * as rx from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['../app.component.sass']
})
export class LoginComponent implements OnInit, OnDestroy {
  loginForm: FormGroup;

  // Subscriptions
  connectedSubscription: rx.Subscription;

  constructor(private fb: FormBuilder,
    private bot: TwitchBot,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit() {
    this.initForm();
    this.connectedSubscription = this.bot.clientConnected.subscribe(this.handleLogin);
  }

  ngOnDestroy() {
    this.connectedSubscription.unsubscribe();
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      token: ['', [Validators.required]]
    });

    const savedUsername = localStorage.getItem('username');
    const savedToken = localStorage.getItem('token');
    console.log(savedUsername);
    console.log(savedToken);
    if (savedUsername) {
      this.loginForm.controls['username'].setValue(savedUsername);
    }

    if (savedToken) {
      this.loginForm.controls['token'].setValue(savedToken);
    }
  }

  login() {
    const username = this.loginForm.value['username'];
    const token = this.loginForm.value['token'];

    if (username && token) {
      this.bot.generateClient(username, token);
      this.bot.connect();
    }
  }

  handleLogin = (user: string) => {
    const username = this.loginForm.value['username'];
    const token = this.loginForm.value['token'];

    localStorage.setItem('username', username);
    localStorage.setItem('token', token);

    this.toastr.success('Logged in!');
    this.bot.loggedIn = true;
    this.router.navigateByUrl('/home');
  }
}
