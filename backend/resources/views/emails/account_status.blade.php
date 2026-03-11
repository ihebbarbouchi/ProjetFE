@component('mail::message')

@if ($status === 'active')
# 🎉 Bienvenue sur EduShare, {{ $user->nom }} !

Nous sommes ravis de vous informer que votre demande d'inscription a été **approuvée** par notre équipe administrative.

Votre compte est désormais actif. Vous pouvez dès à présent vous connecter à la plateforme et commencer à profiter de toutes les fonctionnalités disponibles.

@component('mail::button', ['url' => $loginUrl, 'color' => 'green'])
Se connecter à EduShare
@endcomponent

Si vous avez des questions, n'hésitez pas à nous contacter.

@else
# Mise à jour concernant votre inscription

Bonjour {{ $user->nom }},

Nous vous informons que votre demande d'inscription sur la plateforme **EduShare** a été **rejetée** par notre équipe administrative.

Si vous pensez qu'il s'agit d'une erreur ou si vous souhaitez obtenir plus d'informations sur cette décision, vous pouvez nous contacter directement.

Nous vous remercions de l'intérêt que vous portez à notre plateforme.

@endif

Cordialement,
**L'équipe EduShare**

@component('mail::subcopy')
Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
@endcomponent

@endcomponent
