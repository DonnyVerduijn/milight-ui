# TODO

- [ ] Use color pattern scaling factor
- [ ] Use color pattern base color blend + blending factor
- [ ] Use color pattern individual tweaks (hue, saturation, lightness)
- [ ] Make minikube available in the dev container
- [ ] Make it possible to deploy the app in minikube with helm charts
- [ ] Configure github actions to run e2e tests with minikube

# Ideas
- Color pattern selector (user wants to see all the patterns first based on the changing color, then select the one that matches the preference)
- Add/remove light bulbs
- Color history for each light bulb (or time travel)
- Add/remove transitions (manage through Timelines)
- Allow user to select api endpoint in dev and production
- Add user account + login
- Add user preferences
- Create interface for the controller, to register the device (through login, then setup tunneling service to allow communication between the device and the server)
- explore options to have a more performant controller
- tween slider color change to compensate for bulb delay
